#include <stdio.h>
#include "list.h"

void __fprint_tree__(FILE * fp, _dlist_t* const* list) {
  const _dlist_t * iterator = *list;
  int i = 0;
  if (iterator) { // list contains something
    do {
      fprintf(fp, "Element: %d, ", i);
      fprintf(fp, "ID: %p\n", (void*)iterator);
      fprintf(fp, "   NEXT: %p\n", (void*)iterator->next);
      fprintf(fp, "   PREV: %p\n", (void*)iterator->prev);
      fprintf(fp, "   DATA: %p\n", (void*)iterator->data);
      i++;
      iterator = iterator->next; // move to the next limb
    } while (iterator != *list);
  } else {
    fprintf(fp, "NULL\n");
  }
}
