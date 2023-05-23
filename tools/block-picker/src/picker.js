// import React, {useEffect, useState} from 'react';
// import {ProgressCircle, Flex, ListView, Item, ActionButton, Text, Content, Heading, AlertDialog, IllustratedMessage} from '@adobe/react-spectrum';
// import Asset from '@spectrum-icons/workflow/Asset';
// import NotFound from '@spectrum-icons/illustrations/NotFound';
// import { enrichWithVariants, getUrl } from './copy-utils';
// import getMatchData from '../../../scripts/match';
// import openCloudinary from './cloudinary';
// import { getBlocksMenu } from './blocks';
// import { getLivetickerMenu, getLivetickerGoal } from './liveticker';
//
// function renderEmptyState() {
//   return (
//     <IllustratedMessage>
//       <NotFound />
//       <Heading>No results</Heading>
//       <Content>No results found</Content>
//     </IllustratedMessage>
//   );
// }
//
// export default function Picker() {
//   const [loading, setLoading] = useState(true);
//   const [blocksLibrary, setBlocksLibrary] = useState(null);
//   const [matchData, setMatchdata] = useState(null);
//   const [poll, setPoll] = useState(null);
//   const [openedMenu, setOpenedMenu] = useState(null);
//   const [error, setError] = useState('');
//
//   useEffect(() => {
//     const queryIndexPromise = fetch('/block-library/query-index.json')
//       .then((res) => {
//         return res.json();
//       })
//       .then((json) => {
//         return Promise.allSettled(json.data.map(async (block) => {
//           await enrichWithVariants(block)
//           return block
//         }))
//       }).then((blocks) => {
//         const fulfilledBlocks = [...blocks]
//           .filter((promise) => promise.status === 'fulfilled')
//           .map((promise) => promise.value)
//           setBlocksLibrary({
//             'blocks': fulfilledBlocks.filter(block => block.path.includes('blocks')),
//             'liveticker': fulfilledBlocks.filter(block => block.path.includes('liveticker')),
//           });
//       });
//
//     // const url = new URL(window.location.href).searchParams.get('id').split('/website')[1];
//     const url = '/de/spiele/profis/bundesliga/2022-2023/sv-werder-bremen-fc-bayern-muenchen-06-05-2023';
//     const matchDataPromise = getMatchData(url)
//       .then((data) => {
//         setMatchdata(data);
//       });
//
//     Promise.all([queryIndexPromise, matchDataPromise]).then(() => {
//       setLoading(false);
//
//       // poll for match data every minute
//       setInterval(() => {
//         getMatchData(url).then((data) => {
//           setMatchdata(data);
//           setPoll(Date.now());
//         });
//       }, 1 * 60 * 1000);
//     }).catch((err) => {
//       setError('error');
//       setLoading(false);
//     });
//
//   }, []);
//
//   if (loading) {
//     return <Flex justifyContent={"center"} height={"100%"}><ProgressCircle isIndeterminate /></Flex>
//   }
//
//   if (error) {
//     return <AlertDialog
//       title="Error"
//       variant="warning"
//       primaryActionLabel="Are you signed in?"
//       onPrimaryAction={() => { window.open('https://main--fcbayern--hlxsites.hlx.page/de/')}}>
//       {error}
//     </AlertDialog>
//   }
//
//   if (openedMenu) {
//     switch (openedMenu.menu) {
//       case 'blocks':
//         return getBlocksMenu(setOpenedMenu, renderEmptyState, blocksLibrary.blocks);
//       case 'liveticker':
//         return getLivetickerMenu(setOpenedMenu, renderEmptyState, openedMenu.path, matchData, blocksLibrary.liveticker);
//       case 'cloudinary':
//         openCloudinary(window);
//         break;
//     }
//   }
//
//   return <ListView maxWidth="size-6000" onAction={(menu) => setOpenedMenu({menu})}>
//       <Item key='blocks' hasChildItems>
//         <Text>Blocks</Text>
//       </Item>
//       <Item key='cloudinary'>
//         <Text>Cloudinary</Text><ActionButton onPress={() => setOpenedMenu({menu: 'cloudinary'})}><Asset /></ActionButton>
//       </Item>
//       <Item key='liveticker' hasChildItems>
//         <Text>Liveticker</Text>
//       </Item>
//   </ListView>
//
// }
