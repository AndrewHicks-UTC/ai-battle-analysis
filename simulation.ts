import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { UserWeapon } from "./test-data";
import { Logger } from "./logger";

const openai = new OpenAI();

interface BattleResult {
    battle_description: string;
    winner: string;
}

export async function simulateBattle(testData: UserWeapon[], id: number, systemPrompt: string, logger: Logger): Promise<void> {
    const schema = z.object({
        battle_description: z.string(),
        winner: z.enum(testData.map(user => user.combatant) as [string, ...string[]]),
    });

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 1,
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: JSON.stringify(testData),
            },
        ],
        response_format: zodResponseFormat(schema, "battle_result"),
    });

    const response = completion.choices[0].message.content;
    if (response) {
        let battleResult: BattleResult;
        try {
            battleResult = JSON.parse(response);
        } catch (error) {
            throw `Unable to parse response: ${error}`;
        }

        await logger.logInfo(`Response ${id}:\n\n${battleResult.battle_description}\n\nWinner: ${battleResult.winner}\n\n\n`);
        await logger.logData({id, testData, winner: battleResult.winner});
    } else {
        throw "Unable to get response.";
    }
}