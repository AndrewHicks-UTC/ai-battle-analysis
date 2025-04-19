import { getData, getWeaponCategory, UserWeapon } from "./test-data";
import { writeFile } from "fs/promises";

interface BattleResult {
    id: number;
    testData: UserWeapon[];
    winner: string;
}

interface WinRecord {
    wins: number;
    losses: number;
}

interface Winrate extends WinRecord {
    winrate: number;
}

interface DataPoint extends UserWeapon {
    won: boolean;
}

async function logWinrates(data: BattleResult[]) {
    const winRecords: Record<string, WinRecord> = {};
    data.forEach(result => {
        result.testData.forEach(user => {
            if (user.combatant === result.winner) {
                winRecords[user.weapon] = {
                    wins: (winRecords[user.weapon]?.wins || 0) + 1,
                    losses: (winRecords[user.weapon]?.losses || 0),
                };
                const category = getWeaponCategory(user.weapon);
                winRecords[category] = {
                    wins: (winRecords[category]?.wins || 0) + 1,
                    losses: (winRecords[category]?.losses || 0),
                };
            } else {
                winRecords[user.weapon] = {
                    wins: (winRecords[user.weapon]?.wins || 0),
                    losses: (winRecords[user.weapon]?.losses || 0) + 1,
                };
                const category = getWeaponCategory(user.weapon);
                winRecords[category] = {
                    wins: (winRecords[category]?.wins || 0),
                    losses: (winRecords[category]?.losses || 0) + 1,
                };
            }
        });
    });
    const winrates = Object.entries(winRecords).map(([weapon, winRecord]): [string, Winrate] => {
        return [
            weapon,
            {
                ...winRecord,
                winrate: winRecord.wins / (winRecord.wins + winRecord.losses),
            },
        ];
    }).sort((a, b) => b[1].winrate - a[1].winrate);
    await writeFile("outputs/winrates.csv", "weapon,winrate\n" + winrates.map(winrate => `${escapeCsv(winrate[0])},${winrate[1].winrate}`).join("\n"));
}

function escapeCsv(value: string) {
    if (value.match(/[",\n]/)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

async function exportData(data: BattleResult[]) {
    const dataPoints: DataPoint[] = [];
    data.forEach(result => {
        result.testData.forEach(user => {
            if (user.combatant === result.winner) {
                dataPoints.push({
                    ...user,
                    won: true,
                });
            } else {
                dataPoints.push({
                    ...user,
                    won: false,
                });
            }
        });
    });
    await writeFile(`outputs/exported-data.csv`, "weapon,winProbability,won\n" + dataPoints.map(point => `${escapeCsv(point.weapon)},${point.winProbability},${point.won}`).join("\n"));
}

const data = await getData("250419") as BattleResult[];
logWinrates(data);
exportData(data);