import React, {useEffect, useState} from 'react';
import {ProgressCircle, Flex, ListView, Item, ActionMenu, ActionButton, Text, Content, Heading, IllustratedMessage} from '@adobe/react-spectrum';
import Asset from '@spectrum-icons/workflow/Asset';
import NotFound from '@spectrum-icons/illustrations/NotFound';
import { copyTable, enrichWithVariants, getUrl } from './copy-utils';
import openCloudinary from './cloudinary';
import { getBlocksMenu } from './blocks';
import { getLivetickerMenu, getLivetickerSubMenu } from './liveticker';

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <NotFound />
      <Heading>No results</Heading>
      <Content>No results found</Content>
    </IllustratedMessage>
  );
}

function openPreview(block) {
  window.open(block.path, '_blockpreview');
}

export default function Picker() {
  const [loading, setLoading] = useState(true);
  const [blocksLibrary, setBlocksLibrary] = useState(null);
  const [openedMenu, setOpenedMenu] = useState(null);

  useEffect(() => {
    fetch(getUrl('/block-library/query-index.json'))
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        return Promise.allSettled(json.data.map(async (block) => {
          await enrichWithVariants(block)
          return block
        }))
      }).then((blocks) => {
        const fulfilledBlocks = [...blocks]
          .filter((promise) => promise.status === 'fulfilled')
          .map((promise) => promise.value)
          setBlocksLibrary({
          'blocks': fulfilledBlocks.filter(block => block.path.includes('blocks')),
          'liveticker': fulfilledBlocks.filter(block => block.path.includes('liveticker')),
        });
        setLoading(false);
      })
    
  }, []);

  if (loading) {
    return <Flex justifyContent={"center"} height={"100%"}><ProgressCircle isIndeterminate /></Flex>
  }

  if (openedMenu) {
    switch (openedMenu.menu) {
      case 'blocks':
        return getBlocksMenu(setOpenedMenu, renderEmptyState, blocksLibrary.blocks);
      case 'liveticker':
        return getLivetickerMenu(setOpenedMenu, renderEmptyState, blocksLibrary.liveticker);
      case 'liveticker-submenu':
          return getLivetickerSubMenu(openedMenu.path, setOpenedMenu, renderEmptyState, blocksLibrary.liveticker);
      case 'cloudinary':
        openCloudinary(window);
        break;
    }
  }

  return <ListView maxWidth="size-6000" onAction={(menu) => setOpenedMenu({menu})}>
      <Item key='blocks' hasChildItems>
        <Text>Blocks</Text>
      </Item>
      <Item key='cloudinary'>
        <Text>Cloudinary</Text><ActionButton onPress={() => setOpenedMenu({menu: 'cloudinary'})}><Asset /></ActionButton>
      </Item>
      <Item key='liveticker' hasChildItems>
        <Text>Liveticker</Text>
      </Item>
  </ListView>

}
