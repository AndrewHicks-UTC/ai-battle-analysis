import { getData, UserWeapon } from "./test-data";
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

async function logWinrates() {
    const data = await getData("250305") as BattleResult[];

    const winRecords: Record<string, WinRecord> = {};
    data.forEach(result => {
        result.testData.forEach(user => {
            if (user.combatant === result.winner) {
                winRecords[user.weapon] = {
                    wins: (winRecords[user.weapon]?.wins || 0) + 1,
                    losses: (winRecords[user.weapon]?.losses || 0),
                };
            } else {
                winRecords[user.weapon] = {
                    wins: (winRecords[user.weapon]?.wins || 0),
                    losses: (winRecords[user.weapon]?.losses || 0) + 1,
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
    console.log(winrates);
}

function escapeCsv(value: string) {
    if (value.match(/[",\n]/)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

async function exportData(date: string) {
    const data = await getData(date) as BattleResult[];
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
    await writeFile(`outputs/exported-data${date}.csv`, "weapon,winProbability,won\n" + dataPoints.map(point => `${escapeCsv(point.weapon)},${point.winProbability},${point.won}`).join("\n"));
}

exportData("250305");