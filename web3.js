const Web3 = require('web3');
const chalk = require("chalk");
const { EmbedBuilder } = require('discord.js');

const treasuryABI = require('./abis/treasury.json');
const USER_ADDRESS = "0xA8e48AfbD74f58d16290A5253571430665A3f78c";
const roleId = "1034870591284596826";
const ogRoleId = "1045457186047922247";

var contractAddress = {
    bnb: {
        treasury: '0x812Fa2f7d89e5d837450702bd51120920dccaA99',
        treasuryChannel: '1034872376233570354' // test channel
    },
    oec: {
        treasury: '0xcBEfF02841370997054AdfF624dC490C8cB20406',
        treasuryChannel: '1034872541308801076'
    },
    heco: {
        treasury: '0x7843Bd2aDdE5E54bD6e61C28fA89009240a48C08',
        treasuryChannel: '1034872562733297784'
    },
    skale: {
        treasury: '0x3670C066960252fA7F614B4D886EB399cD292Ceb',
        treasuryChannel: '1034872689782952016'
    },
    aurora: {
        treasury: '0x483416eB3aFA601B9C6385f63CeC0C82B6aBf1fb',
        treasuryChannel: '1034872734724915221'
    },
    avax: {
        treasury: '0x5B1cCb62D2F9c8523abBa89A56432005cef03b99',
        treasuryChannel: '1034872762608668822'
    },
    poly: {
        treasury: '0x216AC39765D920D7f86162Daf9BE1f045f321A8D',
        treasuryChannel: '1034872795257126912'
    },
    csc: {
        treasury: '0xC938a77fe5B6E4291464A80C7DB74cc4dC3909c9',
        treasuryChannel: '1070298972050165760'
    },
    meter: {
        treasury: '0xA6Dff69179fAB797bfd1eaEF292DC0401c7E5B85',
        treasuryChannel: '1073232511745929287'
    }
}

var nodes = {
    bnb: 'https://rpc.ankr.com/bsc',
    oec: 'https://exchainrpc.okex.org',
    heco: 'https://http-mainnet.hecochain.com',
    skale: 'https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux',
    poly: 'https://polygon-rpc.com/',
    avax: 'https://api.avax.network/ext/bc/C/rpc',
    aurora: 'https://mainnet.aurora.dev',
    csc: 'https://rpc.coinex.net',
    meter: 'https://rpc.meter.io/'
}

async function getAllPartner(chain, client) {
    // declaring web3 environment
    const web3 = new Web3(new Web3.providers.HttpProvider(nodes[chain]));

    const contract = new web3.eth.Contract(treasuryABI, contractAddress[chain].treasury);
    const getActivePartnerProjectsIds = await contract.methods.getActivePartnerProjectsIds().call({ from: USER_ADDRESS });
    let projectArray = getActivePartnerProjectsIds;
    const getAmountOfActiveProjects = await contract.methods.getAmountOfActiveProjects().call({ from: USER_ADDRESS });
    x = getAmountOfActiveProjects;
    console.log(`[logdata][getAllpartner]${chain} Multifarm : ${x}`);

    const partnerEmbedMsg = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`${chain.toUpperCase()} Multi-Farm`)

    for (let i = 0; i < x; i++) {
        const getProjectData = await contract.methods.getProjectData(projectArray[i]).call({ from: USER_ADDRESS });
        const getProjectMultiplier = await contract.methods.getProjectMultiplier(projectArray[i]).call({ from: USER_ADDRESS });
        const getRemainingPartnerTokenSupply = await contract.methods.getRemainingPartnerTokenSupply(projectArray[i]).call({ from: USER_ADDRESS });

        // storing data from project data array
        var partnerArray = getProjectData; // project data array
        var tokenDesc = partnerArray[1];
        var getTokenName = tokenDesc.split(" ")[0];
        var multiplier = parseFloat(getProjectMultiplier * 0.000000000000000001).toFixed(3);
        var claimable = parseFloat(getRemainingPartnerTokenSupply * 0.000000000000000001).toFixed(3);

        partnerEmbedMsg.addFields(
            { name: `${getTokenName}`, value: `Multiplier : ${multiplier} \u200B \u200B \u200B | \u200B \u200B \u200B Remaining Tokens : ${claimable}`, inline: false }
        )
    }

    client.channels.fetch(contractAddress[chain].treasuryChannel)
        .then(channel => {
            channel.send({ embeds: [partnerEmbedMsg] });
        });
}

async function getLatestPartner(chain, client) {
    // declaring web3 environment
    const web3 = new Web3(new Web3.providers.HttpProvider(nodes[chain]));

    const contract = new web3.eth.Contract(treasuryABI, contractAddress[chain].treasury); // declairing treasury abi
    const getActivePartnerProjectsIds = await contract.methods.getActivePartnerProjectsIds().call({ from: USER_ADDRESS }); // get all active partner id
    let projectArray = getActivePartnerProjectsIds; // partner ids into an array
    const getAmountOfActiveProjects = await contract.methods.getAmountOfActiveProjects().call({ from: USER_ADDRESS }); // get all active partners
    a = getAmountOfActiveProjects; // number of active partners
    b = a - 1; // last position in the array

    console.log(`[logdata] Last ID : ${projectArray[b]}`);
    // getting partner data using the last position in the array variable [b]
    const getProjectData = await contract.methods.getProjectData(projectArray[b]).call({ from: USER_ADDRESS });
    const getProjectMultiplier = await contract.methods.getProjectMultiplier(projectArray[b]).call({ from: USER_ADDRESS });
    const getRemainingPartnerTokenSupply = await contract.methods.getRemainingPartnerTokenSupply(projectArray[b]).call({ from: USER_ADDRESS });

    console.log(getProjectData);
    // storing data from project data array
    var partnerArray = getProjectData; // project data array
    var tokenImg = partnerArray[0]; // project image
    var tokenDesc = partnerArray[1]; // project description
    var tokenURL = partnerArray[2]; // project URL

    // project trading fee
    if (partnerArray[3].length > 0) {
        var projectTax = partnerArray[3];
    } else {
        var projectTax = 'No additional fee on trading this token.';
    }

    var getTokenName = tokenDesc.split(" ")[0];
    var title = `${getTokenName}  ${chain}`;
    var multiplier = parseFloat(getProjectMultiplier * 0.000000000000000001).toFixed(3);
    var claimable = parseFloat(getRemainingPartnerTokenSupply * 0.000000000000000001).toFixed(3);

    const newPartnerEmbedMsg = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(title)
        .setDescription(tokenDesc)
        .setURL(tokenURL)
        .setThumbnail(tokenImg)
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: 'Multiplier', value: `${multiplier}`, inline: true },
            { name: 'Remaining Tokens', value: `${claimable}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: `Note : ${projectTax}` });

    client.channels.fetch('1050565824987013120')
        .then(channel => {
            channel.send({ embeds: [newPartnerEmbedMsg] });
        });
}

async function getCurrentPartners(chain) {
    // declaring web3 environment
    const web3 = new Web3(new Web3.providers.HttpProvider(nodes[chain]));

    const contract = new web3.eth.Contract(treasuryABI, contractAddress[chain].treasury);
    const getAmountOfActiveProjects = await contract.methods.getAmountOfActiveProjects().call({ from: USER_ADDRESS });
    x = getAmountOfActiveProjects;

    return x;
}

module.exports = { getCurrentPartners, getLatestPartner, getAllPartner, roleId, ogRoleId }