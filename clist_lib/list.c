#include <stdio.h> // fprintf
#include <stdlib.h> // malloc
#include "list.h"

_dlist_t * alloc_limb(void* (*allocator)(void *), void * args)
// allocs one item of the list, and constructs it
{
  _dlist_t * limb;
  limb = malloc(sizeof*limb); // allocs one limb
  if (limb == NULL) { // error check
    fprintf(stderr, "ERROR: cannot allocate %d bytes of memory\n"
	    "Line: %d, File: %s\n", sizeof*limb, __LINE__, __FILE__);
    exit(1); // exit with error
  }
  limb->data = allocator(args); // allocs the new element
  return limb;
}

void _add_item(_dlist_t ** list, int pos, void* (*allocator)(void *), void * args) {
  // a little convention: if pos < 0 then adds the element at the end of the list
  _dlist_t * item = *list;
  _dlist_t * newitem;
  int i;
  
  if (item) { // equiv. if (item != NULL)
    i = pos; // inits the counter
    if (pos > 0)
      while (--i && item->next != *list) // stops when reaches the end
	item = item->next; // go to the next item
    else // pos <= 0
      item = item->prev; // last item in the list
    // now add after item
    newitem = alloc_limb(allocator, args);
    newitem->prev = item;
    newitem->next = item->next;
    item->next->prev = newitem;
    item->next = newitem;
    if (pos == 0)
      (*list) = newitem; // element added at the end
                         // moves the pointer one element backward
  } else { // list is void, so inits list
    (*list) = alloc_limb(allocator, args);
    (*list)->next = *list; // prev is itself
    (*list)->prev = *list; // next is itself
  }
}

void _remove_item(_dlist_t ** list, int pos, void (*destructor)(void*)) {
  _dlist_t* item = *list;
  _dlist_t* detach;
  int i;
  
  if (item) { // if have a non void list
    // 1. find the prior element
    i = pos;
    if (pos > 0)
      while (--i && item->next != *list)
	item = item->next;
    else if (pos == 0)  // chose the first
      item = item->prev;
    else // (pos < 0) choose the last
      item = item->prev->prev;
    // 2. detaches the element
    detach = item->next; // saves the address of the element to delete
    if (detach != item) { // list contains more than one element
      item->next = detach->next;
      detach->next->prev = item;
    } else { // list contains only one element
      (*list) = NULL;
    }
    // 3. frees the element
    destructor(detach->data); // removes data
    free(detach); // frees memory space
    if (*list == detach) // detached first limb
      (*list) = item->next;
  }
}

size_t _list_length(_dlist_t* const* list) {
  const _dlist_t * iterator = *list;
  size_t i = 0;
  if (iterator) {
    do {
      i++;
      iterator = iterator->next;
    } while(iterator != *list);
  }
  return i;
}

void _free_list(_dlist_t ** list, void (*destructor)(void*)) {
  _dlist_t * iterator = *list;
  _dlist_t * nx;
  if (iterator) {
    do {
      nx = iterator->next;
      // frees iterator
      destructor(iterator->data); // removes data
      free(iterator); // frees memory space
      iterator = nx;
    } while(iterator != *list);
    (*list) = NULL;
  } // else list is already empty !
}

void _for_all(_dlist_t* const* list, void (*operation)(const void*, void*), void * args) {
  const _dlist_t * iterator = *list;
  if (iterator) {
    do {
      operation(iterator->data, args); // executes the operation
      iterator = iterator->next; // goes to the next element in the list
    } while (iterator != *list);
  }
}

int _all_of(_dlist_t* const* list, int (*operation)(const void*, void*), void * args) {
  const _dlist_t * iterator = *list;
  if (iterator) {
    do {
      if (operation(iterator->data, args) == 0) // tests the condition
	return 0; // found a false condition. So condition is not TRUE for ALL the element.
      iterator = iterator->next; // goes to the next element in the list
    } while (iterator != *list);
  } // if list is void it does not exist an element which falsifies the condition
  return 1;
}

int _not_all_of(_dlist_t* const* list, int (*operation)(const void*, void*), void * args) {
  const _dlist_t * iterator = *list;
  if (iterator) {
    do {
      if (operation(iterator->data, args) == 0) // tests the condition
	return 1; // found a false condition. So condition is not TRUE for ALL the element.
      iterator = iterator->next; // goes to the next element in the list
    } while (iterator != *list);
  } // if list is void it does not exist an element which falsifies the condition
  return 0;
}

int _any_of(_dlist_t* const* list, int (*operation)(const void*, void*), void * args) {
  const _dlist_t * iterator = *list;
  if (iterator) {
    do {
      if (operation(iterator->data, args) == 1) // tests the condition
	return 1; // found a true condition. So condition is TRUE for AT LEAST ONE of the element.
      iterator = iterator->next; // goes to the next element in the list
    } while (iterator != *list);
  } // if list is void there is no element which verifies the condition
  return 0;
}

int _none_of(_dlist_t* const* list, int (*operation)(const void*, void*), void * args) {
  const _dlist_t * iterator = *list;
  if (iterator) {
    do {
      if (operation(iterator->data, args) == 1) // tests the condition
	return 0; // found a true condition. So condition is not TRUE for NONE of the element (because one exist)
      iterator = iterator->next; // goes to the next element in the list
    } while (iterator != *list);
  } // if list is void there is no element which verifies the condition
  return 1;
}

int _how_many_of(_dlist_t* const * list, int (*operation)(const void*, void*), void * args) {
  const _dlist_t * iterator = *list;
  int cnt = 0;
  if (iterator) {
    do {
      cnt += !!operation(iterator->data, args);
      iterator = iterator->next; // goes to the next element in the list
    } while (iterator != *list);
  } // if list is void there is no element which verifies the condition
  return cnt;
}

int _search(_dlist_t* const* list, const void* key, int (*compar)(const void*, const void*)) {
  const _dlist_t * iterator = *list;
  size_t i = 0;
  if (iterator) {
    do {
      if (compar(iterator->data, key) == 0) // returns 0 if elements are equals
	return i; // found the element!
      i++;
      iterator = iterator->next;
    } while(iterator != *list);
  }
  return -1; // element not found
}

void _selection_sort(_dlist_t ** list, int (*compar)(const void*, const void*)) {
  _dlist_t * iterator = *list,
    * jterator, * min;
  void * swap;
  if (iterator && iterator->next != *list) {
    do {
      min = iterator; // suppose min is iterator 
      jterator = iterator->next;
      do {
	// compare the elements
	if (compar(jterator->data, min->data) < 0)
	  min = jterator;
	jterator = jterator->next;
      } while(jterator != *list); // goes up to the end - 1

      // now swaps the data
      if (min != iterator) {
	swap = min->data;
	min->data = iterator->data;
	iterator->data = swap;
      }
      
      iterator = iterator->next;
    } while(iterator->next != *list); // goes up to the end - 1
  } // else
    //    list cointains 0 or 1 elements, it is already sorted!
}

