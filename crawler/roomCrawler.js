const BrowserService = require('../services/BrowserService');

async function fetchAvailableRooms(checkin, checkout) {

    const url = `https://reservations.fasthotel.me/188/214?entrada=${checkin}&saida=${checkout}&adultos=1#acomodacoes`
    const browser = await BrowserService.getBrowser();
    const page = await BrowserService.getNewPage(browser);
    await page.goto(url, { waitUntil: 'networkidle2' })
    try {
        await page.waitForSelector('[data-campo="cupomAplicado"]');
    } catch (e) {
        console.log('No tariffs found')
    }
    const availableRooms = await page.evaluate(() => {
        const response = []
        const accomodations = document.querySelectorAll('.row.borda-cor')

        accomodations.forEach(accomodation => {
            const name = accomodation.querySelector('h3[data-campo="titulo"]')
            const description = accomodation.querySelector('.quarto.descricao')
            const tariffs = accomodation.querySelectorAll('.row.tarifa')
            const imagesSlide = accomodation.querySelectorAll('.slides li:not(.clone) a[data-fancybox="images"]')
            const images = []
            const price = []

            tariffs.forEach(tariff => {
                const nameRate = tariff.querySelector('h4[data-campo="nome"]')
                const valueRate = tariff.querySelector('b[data-campo="valor"]')
                if (nameRate && valueRate) {
                    price.push({
                        "tariffName": nameRate.textContent.trim(),
                        "value": valueRate.textContent.trim()
                    })
                }
            })

            imagesSlide.forEach((a) => {
                images.push(a.href)
            })
            //Quartos com display:none não possuem tarifa. Portanto não serão enviados
            if (name && description && images.length > 0 && price.length > 0) {
                response.push({
                    "name": name.textContent.trim(),
                    "description": description.textContent.trim(),
                    "image": images,
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