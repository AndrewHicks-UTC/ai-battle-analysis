import { OpenAI } from "openai";
import { UserWeapon } from "./test-data";
import { Logger } from "./logger";

const openai = new OpenAI();

export async function simulateBattle(testData: UserWeapon[], id: number, systemPrompt: string, logger: Logger): Promise<void> {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 1.25,
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: JSON.stringify(testData),
            },
        ],
    });

    const response = completion.choices[0].message.content;
    if (response) {
        let winner: UserWeapon | undefined;
        for (const userData of testData) {
            const winRegex = new RegExp(`${userData.combatant} wins[^A-Za-z]*$`, 'gi');
            if (response.match(winRegex)) {
                winner = userData;
            }
        }

        if (winner) {
            await logger.logData({
                id,
                testData,
                winner: winner.combatant,
            });
            console.log(`Response ${id} logged.`);
        } else {
            console.log(`Unable to get winner for response ${id}.`);
        }

        await logger.logInfo(`Response ${id}:\n\n${response}\n\n`);
    } else {
        throw "Unable to get response.";
    }
}