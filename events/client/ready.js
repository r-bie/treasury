const chalk = require("chalk");
const w3func = require('../../web3');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.green(`${client.user.tag} is online!`));
        
        var arrayChain = [ 'bnb', 'skale' ];

        var partnersCount = {
            bnb: {
                currentPartner: 0,
                newCurrentPartner: 0
            },
            skale: {
                currentPartner: 0,
                newCurrentPartner: 0
            }
        }

        for (let i = 0; i < arrayChain.length; i++) {
            partnersCount[arrayChain[i]].currentPartner = await w3func.getCurrentPartners(arrayChain[i]);
            console.log(`[logdata][${arrayChain[i]}] Current partners in ${arrayChain[i]} : ${partnersCount[arrayChain[i]].currentPartner}`);
        }
        
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

        while (true) {
            await wait(15000);
            await checkForNewPartners('bnb');
            await checkForNewPartners('skale');
        }
    }
}