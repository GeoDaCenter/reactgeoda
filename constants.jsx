export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// const config = {
//   version: 'v1',
//   config: {
//     visState: {
//       layers: [
//         {
//           type: 'geojson',
//           config: {
//             colorField: {
//               name: 'jenksCategory',
//               type: 'string',
//               valueAccessor: function (values) {
//                 return maybeToDate.bind(null, false, jenksIdx, '', rowContainer)(values);
//               }
//             },
//             colorRange: {
//               category: 'custom',
//               type: 'diverging',
//               name: 'ColorBrewer RdBu-5',
//               colors: cb
//                 ? colorbrewer.YlOrBr[cb.breaks.length - 1].map(
//                     color => `#${color.match(/[0-9a-f]{2}/g).join('')}`
//                   )
//                 : []
//             },
//             isVisible: true,
//             label: 'choro'
//           }
//         }
//       ]
//     }
//   }
// };
