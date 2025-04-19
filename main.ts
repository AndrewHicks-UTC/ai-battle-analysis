import { Logger } from "./logger";
import { simulateBattle } from "./simulation";
import { generateTestData, getSystemPrompt } from "./test-data";
import { initTestData } from "./test-data";

async function main(): Promise<void> {
    await initTestData();

    const logger = new Logger();
    const totalSimulations = 3000;
    const batchSize = 200;
    const batches = Math.ceil(totalSimulations / batchSize);

    for (let batch = 0; batch < batches; batch++) {
        console.log(`Starting batch ${batch + 1}/${batches}...`);
        
        // Process this batch of simulations
        const startIndex = batch * batchSize;
        const endIndex = Math.min((batch + 1) * batchSize, totalSimulations);
        const promises: Promise<void>[] = [];
        
        for (let i = startIndex; i < endIndex; i++) {
            promises.push(
                simulateBattle(
                    generateTestData(5),
                    i,
                    getSystemPrompt(),
                    logger,
                )
            );
        }

        // Wait 61 seconds because of rate limits
        if (batch < batches - 1) {
            promises.push(new Promise((resolve) => setTimeout(resolve, 61 * 1000)));
        }

        await Promise.all(promises);
    }
    
    console.log("All simulations complete.");
}

main();