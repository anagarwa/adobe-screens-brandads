import React, { useState, useMemo } from 'react';
import {ComboBox, View, Flex, ListView, Item, ActionButton, Text, TextArea, TextField, Checkbox} from '@adobe/react-spectrum';
import ChevronLeft from '@spectrum-icons/workflow/ChevronLeft';
import Copy from '@spectrum-icons/workflow/Copy';
import { copyReplaceTable } from './copy-utils';
import { getNewResult, getNewTime, getResult } from '../../../scripts/match';

const onCopy = (tokens, block, matchData) => {
  tokens['{id}'] = Date.now();
  if (!tokens['{time}']) tokens['{time}'] = getNewTime(matchData);
  if (!tokens['{push}']) tokens['{push}'] = 'no';
  copyReplaceTable(block.variants[0], tokens);
}

export function getLivetickerMenu(setOpenedMenu, renderEmptyState, path, matchData, blocks) {

  const selectedBlock = blocks.find((block) => block.path.includes(path));

  // transform blocks into ComboBox items
  const comboBoxItems = blocks.map((block) => ({ name: block.title, key: block.path }));
  
  return <>
    <ActionButton onPress={() => setOpenedMenu(path ? { menu: 'liveticker', path: null }  : null)} isQuiet><ChevronLeft /><Text>Back</Text></ActionButton>
    <Flex direction="column" width="100%" justifyContent="center" gap="size-100">
      <View backgroundColor="gray-200" padding="size-150">
        <ComboBox
          label="Event Type"
          width="100%"
          defaultItems={comboBoxItems}
          selectedKey={selectedBlock ? selectedBlock.path : null}
          onSelectionChange={(path) => setOpenedMenu({menu: 'liveticker', path})}>
            {item => <Item>{item.name}</Item>}
        </ComboBox>
      </View>
      {
      (selectedBlock) ? EVENTS[selectedBlock.title.toLowerCase()](selectedBlock, matchData) : null
    }
    </Flex>
    
    {
      (!selectedBlock) ? <>
      <ListView
        maxWidth="size-6000"
        minHeight={(blocks && blocks.length > 0) ? undefined : 'size-3000'}
        renderEmptyState={renderEmptyState}
        onAction={(path) => setOpenedMenu({menu: 'liveticker', path})}
      >
        {
          blocks?.map((block) => {
            return <Item key={block.path} hasChildItems>
              <Text>{block.title}</Text>
            </Item>
          })
        }
      </ListView>
      </> : null
    }
  </>
}

const EVENTS = {
  goal(block, matchData) {
    const tokens = {};
    const comboBoxItems = Object.keys(matchData.allPlayers).map(key => ({ id: key, name: `${(`0${matchData.allPlayers[key].shirtNumber}`).slice(-2)} - ${matchData.allPlayers[key].playerName}` }) );
  
    return <>
      <View backgroundColor="gray-200" padding="size-150">
        <ComboBox
          label="Goal by"
          width="100%"
          defaultItems={comboBoxItems}
          onSelectionChange={(id) => {
            if (!id) return;
            const team = matchData.home.id === matchData.allPlayers[id].team ? matchData.home : matchData.away;
            const newResult = getNewResult(matchData, id).join(':');
            tokens['{highlight}'] = matchData.allPlayers[id].isFCBayern ? 'Tooor für den FC Bayern!' : `Tor für ${team.nameMedium}`;
            tokens['{text}'] = matchData.allPlayers[id].isFCBayern ? `${newResult} durch ${matchData.allPlayers[id].playerNameFirst}` : `${newResult} durch ${matchData.allPlayers[id].playerNameLast}`;
            tokens['{number}'] = matchData.allPlayers[id].shirtNumber;
            tokens['{first}'] = matchData.allPlayers[id].playerNameFirst;
            tokens['{last}'] = matchData.allPlayers[id].playerNameLast;
            tokens['{optaid}'] = id;
            tokens['{score}'] = getNewResult(matchData, id).join(' : ');
          }}>
            {item => <Item>{item.name}</Item>}
        </ComboBox>
      </View>
      <View backgroundColor="gray-200" padding="size-150">
        <Checkbox defaultSelected onChange={(selected) => tokens['{push}'] = selected }>Push</Checkbox>
        <ActionButton onPress={() => onCopy(tokens, block, matchData)}><Text>Copy to Clipboard</Text><Copy /></ActionButton>
      </View>
    </>
  },

  changes(block, matchData) {
    const tokens = {};
    const comboBoxItems = Object.keys(matchData.allPlayers).map(key => ({ id: key, name: `${(`0${matchData.allPlayers[key].shirtNumber}`).slice(-2)} - ${matchData.allPlayers[key].playerName}` }) );
  
    return <>
      <View backgroundColor="gray-200" padding="size-150">
        <ComboBox
          label="In"
          width="100%"
          defaultItems={comboBoxItems}
          onSelectionChange={(id) => {
            if (!id) return;
            tokens['{in-optaid}'] = id;
            tokens['{in-number}'] = matchData.allPlayers[id].shirtNumber;
            tokens['{in-name-first}'] = matchData.allPlayers[id].playerNameFirst;
            tokens['{in-name-last}'] = matchData.allPlayers[id].playerNameLast;
          }}>
            {item => <Item>{item.name}</Item>}
        </ComboBox>
      </View>
      <View backgroundColor="gray-200" padding="size-150">
        <ComboBox
          label="Out"
          width="100%"
          defaultItems={comboBoxItems}
          onSelectionChange={(id) => {
            if (!id) return;
            tokens['{out-optaid}'] = id;
            tokens['{out-number}'] = matchData.allPlayers[id].shirtNumber;
            tokens['{out-name-first}'] = matchData.allPlayers[id].playerNameFirst;
            tokens['{out-name-last}'] = matchData.allPlayers[id].playerNameLast;
          }}>
            {item => <Item>{item.name}</Item>}
        </ComboBox>
      </View>
      <View backgroundColor="gray-200" padding="size-150">
        <Checkbox onChange={(selected) => tokens['{push}'] = selected }>Push</Checkbox>
        <ActionButton onPress={() => onCopy(tokens, block, matchData)}><Text>Copy to Clipboard</Text><Copy /></ActionButton>
      </View>
    </>
  },

  penalty(block, matchData) {
    const tokens = {};
    const comboBoxItems = [
      { name: matchData.home.name, key: matchData.home.id },
      { name: matchData.away.name, key: matchData.away.id },
    ];
  
    return <>
      <View backgroundColor="gray-200" padding="size-150">
        <ComboBox
          label="Penalty for"
          width="100%"
          defaultItems={comboBoxItems}
          onSelectionChange={((id) => {
            if (!id) return;
            const team = matchData.home.id === id ? matchData.home : matchData.away;
            tokens['{highlight}'] = team.isFCBayern ? 'Elfmeter für den FC Bayern!' : `Elfmeter für ${team.nameMedium}`;
          })}>
            {item => <Item>{item.name}</Item>}
        </ComboBox>
      </View>
      <View backgroundColor="gray-200" padding="size-150">
        <TextArea
          label="Comment"
          width="100%"
          inputMode="text"
          onChange={(text) => {
            if (!text) return;
            tokens['{text}'] = text;
          }}/>
      </View>
      
      <View backgroundColor="gray-200" padding="size-150">
        <Checkbox onChange={(selected) => tokens['{push}'] = selected }>Push</Checkbox>
        <ActionButton onPress={() => onCopy(tokens, block, matchData)}><Text>Copy to Clipboard</Text><Copy /></ActionButton>
      </View>
    </>
  },

  whistle(block, matchData) {
    const tokens = {};
    const comboBoxItems = [
      { name: 'Start first half', key: 'first' },
      { name: 'Start second half', key: 'second' },
      { name: 'Finish', key: 'finish' },
    ];
  
    return <>
      <View backgroundColor="gray-200" padding="size-150">
        <ComboBox
          label="Which half"
          width="100%"
          defaultItems={comboBoxItems}
          onSelectionChange={((half) => {
            if (!half) return;
            tokens['{half}'] = half;
            switch (half) {
              case 'first':
                tokens['{time}'] = 1;
                tokens['{timestamp}'] = Date.now();
                tokens['{highlight}'] = 'Es geht los!';
                tokens['{text}'] = `Anpfiff zum Spiel zwischen ${matchData.home.nameMedium} und ${matchData.away.nameMedium}!`;
                break;
              case 'second':
                tokens['{time}'] = 46;
                tokens['{timestamp}'] = Date.now();
                tokens['{highlight}'] = 'Es geht weiter!';
                tokens['{text}'] = `Anpfiff zur zweiten Halbzeit zwischen ${matchData.home.nameMedium} und ${matchData.away.nameMedium}!`;
                break;
              case 'finish':
                tokens['{time}'] = 90;
                tokens['{timestamp}'] = Date.now();
                tokens['{highlight}'] = 'Das Spiel ist aus!';
                tokens['{text}'] = `Der FC Bayern gewinnt mit ${getResult(matchData).join(':')}!`;
                break;
            }
          })}>
            {item => <Item>{item.name}</Item>}
        </ComboBox>
      </View>
      <View backgroundColor="gray-200" padding="size-150">
        <Checkbox onChange={(selected) => tokens['{push}'] = selected }>Push</Checkbox>
        <ActionButton onPress={() => {
          onCopy(tokens, block, matchData);
        }}><Text>Copy to Clipboard</Text><Copy /></ActionButton>
      </View>
    </>
  }
};
