#include <stdlib.h> // malloc, realloc, free
/*
void list_init(mpzlist_t * list) { // inits a list
  list->len = 0;
  list->list = NULL;
}

void list_clear(mpzlist_t * list) { // inits a list
  size_t i;
  for (i = 0; i < list->len; i++)
    mpz_clear(list->list[i]);
  free(list->list);
  list->len = 0;
}

void list_add(mpzlist_t * list, const mpz_t tosave) { // inits a list
  list->len++;
  list->list = realloc((list->list), (list->len)*sizeof(*(list->list)));
  mpz_init_set(list->list[list->len - 1], tosave); // copies the value
}

void list_init(mpzlist_t * list, size_t toalloc) { // inits a table
  size_t i;
  list->alloc = toalloc;
  list->list = malloc(toalloc*sizeof(*(list->lists)));
  // now inits all the allocated lists
  for (i = 0; i < toalloc; i++)
    list_init((list->list) + i);
  list->len = 0; // effectively used limbs
}
void list_clear(mpzlist_t * list) { // inits a list
  size_t i;
  for (i = 0; i < list->toalloc; i++)
    list_clear(list->list + i);
  free(list->list);
  list->len = 0;
}

void list_add(mpzlist_t * list, const mpz_t tosave) { // inits a list
  if (list->len + 1 >= list->alloc) {
    fprintf(stderr, "ERROR: Alloc more data\n");
    exit(1);
  }
  mpz_init_set(list->list[list->len], tosave); // copies the value
  list->len++;
}
*/

#include "list.h"

// ---------- GENERAL PURPOSE LIBRARY --------

void array_init(array_t * list, size_t alloc, size_t size) {
  size_t i;
  list->size = size;
  list->alloc = alloc; // allocs this number of bytes
  list->data = malloc((list->alloc)*sizeof(*list->data)); // allocs enough data
  list->len = 0; // at the init there is no data allocated
}

void array_add(array_t * list, void (*cp)(void*, const void*), void * item) {
  if (list->len + 1 >= list->alloc) { // allocs one more data
    list->alloc = list->len + 1;
    list->data = realloc(list->data, (list->alloc)*sizeof(*list->data)); // allocs enough data
  }
  list->len++; // added one element
  cp(list->data + (list->len-1)*(list->size), item); // copies the new data
  list->len = 0; // at the init there is no data allocated
}

void array_clear(array_t * list, void (*destructor)(void*)) {
  size_t i;
  for (i = 0; i < (list->alloc); i++)
    destructor(list->data + i*(list->size)); // destroys the data
  free(list->data); // allocs enough data
  list->data = NULL;
  list->len = 0; // at the init there is no data allocated
  list->alloc = 0;
  // list->size = size; // do not touch this value. May be useful in other cases
}

array_iterator_t array_begin(const array_t * array) {
    // returns a pointer to the first data
    return array->data;
}

array_iterator_t array_end(const array_t * array) {
    return array->data + (array->len)*(array->size); // returns first element not included in the array
}

void iterator_next(const array_t * array, array_iterator_t * iterator) {
    // increments the iterator
    (*iterator) += array->size;
}

void iterator_prev(const array_t * array, array_iterator_t * iterator) {
    (*iterator) -= array->size;
}

/***** DEBUG PURPOSE ****/

#include <stdio.h> // fprintf

void __fprint_array__(FILE * fp, const array_t * array) {
    size_t i;
    fprintf(fp, "Array Lenght: %d\nArray real lenght: %d\n", array->len, array->alloc);
    fprintf(fp, "Array (each element) Size: %d\n", array->size);
    /*
    for (i = 0; i < array->len; i++) {
        fprintf(fp, "%d: %p\n", i, *(array->data + i*array->size));
    }
   */
}
