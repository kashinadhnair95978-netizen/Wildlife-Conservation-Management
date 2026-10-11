const imgUrl = (id: string, w = 1200, h = 800, q = 60) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`

export const IMAGES = {
  hero: imgUrl('photo-1516026672322-bc52d61a55d5', 2000, 1100, 70),
  heroAlt: imgUrl('photo-1523952578875-e6bb18b26645', 2000, 1100, 70),
  heroForest: imgUrl('photo-1441974231531-c6227db76b6e', 2000, 1100, 70),

  species: {
    tiger: imgUrl('photo-1561731216-c3a4d99437d5'),
    tigerWhite: imgUrl('photo-1570042225831-d98fa7577f1e'),
    leopard: imgUrl('photo-1474511320723-9a56873867b5'),
    elephant: imgUrl('photo-1557050543-4d5f6e621963'),
    elephantDark: imgUrl('photo-1514995669114-6081e934b693'),
    rhino: imgUrl('photo-1576092768241-dec231879fc3'),
    gaur: imgUrl('photo-1504208434309-cb69f4fe52b0'),
    deer: imgUrl('photo-1484406566174-9da000fda645'),
    tahr: imgUrl('photo-1464822759023-fed622ff2c3b'),
    bird: imgUrl('photo-1518709268805-4e9042af9f23'),
    peacock: imgUrl('photo-1546182990-dffeafbe841d'),
    crane: imgUrl('photo-1560807707-8cc77767d783'),
    kingfisher: imgUrl('photo-1523626752472-b55a628f1acc'),
  },

  habitat: {
    forest: imgUrl('photo-1441974231531-c6227db76b6e'),
    grassland: imgUrl('photo-1504208434309-cb69f4fe52b0'),
    wetland: imgUrl('photo-1520962922320-2038eebab146'),
    mountain: imgUrl('photo-1464822759023-fed622ff2c3b'),
    coastal: imgUrl('photo-1507525428034-b723cf961d3e'),
    river: imgUrl('photo-1505142468610-359e7d316be0'),
    lake: imgUrl('photo-1546182990-dffeafbe841d'),
  },

  area: {
    park1: imgUrl('photo-1464822759023-fed622ff2c3b'),
    park2: imgUrl('photo-1441974231531-c6227db76b6e'),
    park3: imgUrl('photo-1520962922320-2038eebab146'),
    park4: imgUrl('photo-1505142468610-359e7d316be0'),
    park5: imgUrl('photo-1468421870903-4df1664ac249'),
  },

  rescue: imgUrl('photo-1547721064-da6cfb341d50'),
  patrol: imgUrl('photo-1533628635777-112b2239b1c7'),
  conservation: imgUrl('photo-1512428559087-560fa5ceab42'),
  tracking: imgUrl('photo-1552410260-0fd9b577afa6'),
  study: imgUrl('photo-1519817914152-22d216bb9170'),
  portrait: imgUrl('photo-1438761681033-6461ffad8d80'),

  generic: [
    imgUrl('photo-1570042225831-d98fa7577f1e'),
    imgUrl('photo-1514995669114-6081e934b693'),
    imgUrl('photo-1504208434309-cb69f4fe52b0'),
    imgUrl('photo-1441974231531-c6227db76b6e'),
  ],
}

export const DEFAULT_PROFILE_IMAGE = IMAGES.portrait