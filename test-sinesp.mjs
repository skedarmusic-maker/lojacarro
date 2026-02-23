const sinespApi = require('sinesp-api');

async function test(placa) {
    try {
        let vehicle = await sinespApi.search(placa);
        console.log(JSON.stringify(vehicle, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

test('SZA8F36');
