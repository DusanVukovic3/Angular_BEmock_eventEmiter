import { Item } from './item.model';

export interface ItemCreatedEvent {
  type: 'ItemCreated';
  item: Item;
}

export interface ItemUpdatedEvent {
  type: 'ItemUpdated';
  item: Item;
}

export interface ItemDeletedEvent {
  type: 'ItemDeleted';
  itemId: string;
}

export type ItemEvent = ItemCreatedEvent | ItemUpdatedEvent | ItemDeletedEvent;
