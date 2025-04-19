import { readFile } from 'fs/promises';

// Interface for the user-weapon pairs
export interface UserWeapon {
    combatant: string;
    weapon: string;
    winProbability: number;
}
let users: string[] = [];
let weapons: string[] = [];
let tracks: string[] = [];
let systemPrompt: string = "";

function shuffle<T>(array: T[]) {
    let shuffled = array.slice();
    let currentIndex = shuffled.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
}

// Function to load file contents into an array
async function loadFile(path: string): Promise<string[]> {    
    try {
        const data = await readFile(path, 'utf8');
        // Split the file content by newlines and filter out empty lines
        return data.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
        console.error(`Error reading file ${path}:`, error);
        return [];
    }
}

export async function getData(day: string) {
    const dataLines = await loadFile(`outputs/data${day}.jsonl`);
    return dataLines.map(line => JSON.parse(line));
}

export async function initTestData() {
    users = await loadFile("data/users.txt");
    weapons = await loadFile("data/weapons.txt");
    tracks = await loadFile("data/tracks.txt");
    systemPrompt = await readFile("data/prompt.txt", "utf8");
}

function getTrack() {
    return tracks[Math.floor(Math.random() * tracks.length)];
}

export function getSystemPrompt() {
    return systemPrompt.replace("TRACK_NAME", getTrack());
}

// Function to generate random user-weapon-weight tuples
export function generateTestData(n: number): UserWeapon[] {
    const chosenUsers = shuffle(users).slice(0, n);
    const chosenWeapons = shuffle(weapons).slice(0, n);

    let totalWeight = 0;
    const weights = new Array(n).fill(0).map(() => {
        let weight = Math.pow(Math.random(), 3);
        totalWeight += weight;
        return weight;
    }).map(weight => weight / totalWeight);

    // Generate n random pairs
    return chosenUsers.map((user, i) => ({
        combatant: user,
        weapon: chosenWeapons[i],
        winProbability: weights[i],
    }));
}