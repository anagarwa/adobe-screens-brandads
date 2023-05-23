import React, {useEffect, useState} from 'react';
import {ListView, Item, ActionMenu, ActionButton, Text} from '@adobe/react-spectrum';
import ChevronLeft from '@spectrum-icons/workflow/ChevronLeft';
import Preview from '@spectrum-icons/workflow/Preview';
import Copy from '@spectrum-icons/workflow/Copy';
import { copyTable, enrichWithVariants } from './copy-utils';

export function getBlocksMenu(setOpenedMenu, renderEmptyState, blocks) {
  return <>
  <ActionButton onPress={() => setOpenedMenu(null)} isQuiet><ChevronLeft /><Text>Back</Text></ActionButton>
  <ListView
    maxWidth="size-6000"
    minHeight={(blocks && blocks.length > 0) ? undefined : 'size-3000'}
    renderEmptyState={renderEmptyState}
    onAction={(index) => copyTable(blocks[index].variants[0])}
  >
    
    {
      blocks?.map((block, i) => {
        return <Item key={i}>
          <Text>{block.title}</Text>
          <ActionButton onPress={() => copyTable(block.variants[0])}><Copy /></ActionButton>
        </Item>
      })
    }
  </ListView>
</>
}