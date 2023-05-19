import React, {useEffect, useState} from 'react';
import {ListView, Item, ActionButton, Text} from '@adobe/react-spectrum';
import ChevronLeft from '@spectrum-icons/workflow/ChevronLeft';
import Copy from '@spectrum-icons/workflow/Copy';
import {ComboBox, Item, View, Flex} from '@adobe/react-spectrum'
import { copyReplaceTable } from './copy-utils';

export function getLivetickerMenu(setOpenedMenu, renderEmptyState, blocks) {
  
 return <>
  <ActionButton onPress={() => setOpenedMenu(null)} isQuiet><ChevronLeft /><Text>Back</Text></ActionButton>
  <ListView
    maxWidth="size-6000"
    minHeight={(blocks && blocks.length > 0) ? undefined : 'size-3000'}
    renderEmptyState={renderEmptyState}
    onAction={(blockPath) => setOpenedMenu({menu: 'liveticker-submenu', path: blockPath})}
  >
    
    {
      blocks?.map((block) => {
        return <Item key={block.path} hasChildItems>
          <Text>{block.title}</Text>
        </Item>
      })
    }
  </ListView>
</>
}

export function getLivetickerSubMenu(path, setOpenedMenu, renderEmptyState, blocks) {
  const block = blocks.find((block) => block.path.includes(path));
  const tokens = {};

  const players = [
    {id: '1', name: 'Manuel Neuer'},
  ];

  return <>
  <ActionButton onPress={() => setOpenedMenu({menu: 'liveticker'})} isQuiet><ChevronLeft /><Text>Back</Text></ActionButton>
  <Flex direction="column" width="size-2000" gap="size-100">
    <View height="size-800">
      <ComboBox label="Player" items={players} onSelectionChange={(id) => {
        const player = players.filter((player) => player.id === id)[0];
        tokens['{player name}'] = player.name;
        tokens['{player number}'] = id
      }}>
        {item => <Item>{item.name}</Item>}
      </ComboBox>
    </View>
    <View height="size-800">
      <ActionButton onPress={() => copyReplaceTable(block.variants[0], tokens)}><Copy /></ActionButton>
    </View>
  </Flex>
</>
}