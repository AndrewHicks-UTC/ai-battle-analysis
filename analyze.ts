import { getData, getWeaponCategory, getWeaponPostfix, initTestData, UserWeapon } from "./test-data";
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
            const won = user.combatant === result.winner;
            const [postfix, weapon] = getWeaponPostfix(user.weapon);
            const category = getWeaponCategory(weapon);

            winRecords[weapon] = {
                wins: (winRecords[weapon]?.wins || 0) + (won ? 1 : 0),
                losses: (winRecords[weapon]?.losses || 0) + (won ? 0 : 1),
            };
            winRecords[category] = {
                wins: (winRecords[category]?.wins || 0) + (won ? 1 : 0),
                losses: (winRecords[category]?.losses || 0) + (won ? 0 : 1),
            };
            if (postfix) {
                winRecords[postfix] = {
                    wins: (winRecords[postfix]?.wins || 0) + (won ? 1 : 0),
                    losses: (winRecords[postfix]?.losses || 0) + (won ? 0 : 1),
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

    let chi2 = 0;
    Object.values(winRecords).forEach(winRecord => {
        const expectedWins = (winRecord.wins + winRecord.losses) * 0.2;
        chi2 += (winRecord.wins - expectedWins) ** 2 / expectedWins;
    });
    console.log(chi2);

    await writeFile("outputs/winrates.csv", "weapon,winrate\n" + winrates.map(winrate => `${escapeCsv(winrate[0])},${winrate[1].winrate}`).join("\n"));
}

async function logUserWinrates(data: BattleResult[]) {
    const winRecords: Record<string, WinRecord> = {};
    let chi2 = 0;
    data.forEach(result => {
        result.testData.forEach(user => {
            const won = user.combatant === result.winner;
            winRecords[user.combatant] = {
                wins: (winRecords[user.combatant]?.wins || 0) + (won ? 1 : 0),
                losses: (winRecords[user.combatant]?.losses || 0) + (won ? 0 : 1),
            };
        });
    });
    Object.values(winRecords).forEach(winRecord => {
        const expectedWins = (winRecord.wins + winRecord.losses) * 0.2;
        chi2 += (winRecord.wins - expectedWins) ** 2 / expectedWins;
    });
    console.log(chi2);
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

async function main() {
    const data = await getData("250419") as BattleResult[];
    await initTestData();
    logWinrates(data);
    logUserWinrates(data);
    exportData(data);
}

main();