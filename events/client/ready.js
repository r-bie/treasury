const chalk = require("chalk");
const { setInterval } = require("node:timers");
const w3func = require('../../web3');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.green(`${client.user.tag} is online!`));

        var arrayChain = ['bnb', 'skale', 'meter'];

        var partnersCount = {
            bnb: {
                currentPartner: 0,
                newCurrentPartner: 0
            },
            skale: {
                currentPartner: 0,
                newCurrentPartner: 0
            },
            meter: {
                currentPartner: 0,
                newCurrentPartner: 0
            }
        }

        // storing base values for current partners
        for (let i = 0; i < arrayChain.length; i++) {
            partnersCount[arrayChain[i]].currentPartner = await w3func.getCurrentPartners(arrayChain[i]);
            console.log(`[logdata][${arrayChain[i]}] Current partners in ${arrayChain[i]} : ${partnersCount[arrayChain[i]].currentPartner}`);
        }

        // check if there is new treasury
        async function checkForNewPartners(chain) {
            partnersCount[chain].newCurrentPartner = await w3func.getCurrentPartners(chain);

            if (partnersCount[chain].currentPartners < partnersCount[chain].newCurrentPartner) {
                console.log(`[logdata]${chalk.green(`[${chain}] There's a new multifarm`)}`);

                partnersCount[chain].currentPartners = partnersCount[chain].newCurrentPartner;

                client.channels.fetch('1050565824987013120')
                    .then(channel => {
                        channel.send(`<@&${w3func.ogRoleId}>`);
                    });

                await w3func.getLatestPartner(chain, client);
            } else {
                partnersCount[chain].currentPartners = partnersCount[chain].newCurrentPartner;
                console.log(`[logdata][${chain}] Current Partners in ${chain}: ${partnersCount[chain].currentPartners}`);
            }
        }

        // check multiplier values for treasury on each chain
        async function getOngoingPartners(client) {
            try {
                await w3func.getAllPartner('bnb', client);
                await w3func.getAllPartner('oec', client);
                await w3func.getAllPartner('heco', client);
                await w3func.getAllPartner('skale', client);
                await w3func.getAllPartner('poly', client);
                await w3func.getAllPartner('avax', client);
                await w3func.getAllPartner('aurora', client);
                await w3func.getAllPartner('csc', client);
                await w3func.getAllPartner('meter', client);
            } catch (error) {
                console.log(error);
            }
        }

        // 1800000 = 30mins
        setInterval(() => {
            getOngoingPartners(client);
        }, 1800000);

        // loop the function to check every 10s
        while (true) {
            await wait(10000);
            await checkForNewPartners('bnb');
            await checkForNewPartners('skale');
            await checkForNewPartners('meter');
        }
    }
}