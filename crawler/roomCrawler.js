const BrowserService = require('../services/BrowserService');

async function fetchAvailableRooms(checkin, checkout) {

    const url = `https://reservations.fasthotel.me/188/214?entrada=${checkin}&saida=${checkout}&adultos=1#acomodacoes`
    const browser = await BrowserService.getBrowser();
    const page = await BrowserService.getNewPage(browser);
    await page.goto(url, { waitUntil: 'networkidle2' })
    try {
        await page.waitForSelector('.row.tarifa');
    } catch (e) {
        //A primeira pesquisa encontrará quartos com ou sem preços. Caso nao encontre,
        //fará uma segunda requisição. Isso foi feito para contornar os 3 possiveis tipos de resposta,
        // sendo que não encontrei um seletor que aguarde as tarifas serem carregadas, mas que exista 
        // quando não existem acomodações na resposta do site.
        if(e.name == 'TimeoutError') {
            try {
                await page.waitForSelector('.row.borda-cor.msgSemQuarto');
            }catch(innerError){
                throw new Error('Internal Server Error');
            }
        }else{
            throw new Error('Internal Server Error');
        }
    }
    const availableRooms = await page.evaluate(() => {
        const response = []
        const  roomsNotAvailable = document.querySelectorAll('.row.borda-cor.msgSemQuarto')
        const style = roomsNotAvailable? roomsNotAvailable[0].getAttribute('style') : null
        if(style && !style.includes('display: none;')) {
            return []
        }
        const accomodations = document.querySelectorAll('.row.borda-cor')
        accomodations.forEach(accomodation => {
            const name = accomodation.querySelector('h3[data-campo="titulo"]')
            const description = accomodation.querySelector('.quarto.descricao')
            const tariff = accomodation.querySelector('div[data-tarifa-codigo="17"] b[data-campo="valor"]')
            const imageActive = accomodation.querySelector('.slides li.flex-active-slide a[data-fancybox="images"]')
            const price = tariff ? tariff.textContent.trim() : null
            if (name && description && imageActive && price) {
                response.push({
                    "name": name.textContent.trim(),
                    "description": description.textContent.trim(),
                    "image": imageActive.getAttribute('href'),
                    "price": price,
                })
            }
        });
        return response
    })
    await BrowserService.closeBrowser()
    return availableRooms
}

module.exports = { fetchAvailableRooms };