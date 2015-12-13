#include <stdio.h> // input outout
#include <stdlib.h> // malloc
#include "list.h"

void * int_alloc(void * args) { // allocs one integer, and returns it pointer
  void * ptr = malloc(sizeof(int));
  *(int*)ptr = *(int*)args; // assign new integer
  return ptr;
}

void int_dealloc(void * data) {
  free(data); // frees the allocated integer
}

void int_print(const void * item, void * args) {
  printf("%d ", *(const int*)item); // args are not used
}

int int_compar(const void * p1, const void * p2) {
  return *(const int*)p1 - *(const int*)p2;
}

int divisible(const void * item, void * args) {
  const int op1 = *(const int*)item;
  const int op2 = *(const int*)args;
  return !(op1 % op2);
}

int main(int argc, char * argv[]) {
    dlist_t sample_list = NULL;
    int var;

    printf("==== Adding elements ====\n");
    printf("Starting list:\n");
    for_all(sample_list, int_print, NULL); // prints the list
    printf("\n");
    printf("lenght: %d\n", list_length(sample_list));
    
    add_item(sample_list, 0, int_alloc,  (var=10, &var));
    add_item(sample_list, 1, int_alloc,  (var=20, &var));
    add_item(sample_list, 2, int_alloc,  (var=30, &var));
    add_item(sample_list, -1, int_alloc, (var=40, &var));
    add_item(sample_list, 1, int_alloc,  (var=50, &var));
    push_back(sample_list, int_alloc,    (var=70, &var));
    push_front(sample_list, int_alloc,   (var=60, &var));

    printf("added some elements:\n");
    for_all(sample_list, int_print, NULL); // prints the list
    printf("\n");
    printf("lenght: %d\n", list_length(sample_list));

    printf("\n");
    printf("==== Now verify some conditions ===\n");
    if (all_of(sample_list, divisible, (var = 10, &var)))
      printf("All of the elements in the list are divisible by 10\n");
    if (not_all_of(sample_list, divisible, (var = 20, &var)))
      printf("Not All of the elements in the list are divisible by 20\n");
    if (any_of(sample_list, divisible, (var = 7, &var)))
      printf("At least one of the elements in the list is divisible by 7\n");
    if (none_of(sample_list, divisible, (var = 11, &var)))
      printf("none of the elements in the list is divisible by 11\n");
    printf("There are %d elements in the list divisible by 6\n",
	   how_many_of(sample_list, divisible, (var = 6, &var)));

    printf("\n");
    printf("==== Searching ====\n");
    int pos;
    var = 30;
    pos = search(sample_list, &var, int_compar);
    if (pos >= 0)
      printf("Found item \"%d\" at position: %d\n", var, pos);
    var = 23;
    pos = search(sample_list, &var, int_compar);
    if (pos < 0)
      printf("%d not found", var);
    
    printf("\n");
    printf("==== Sorting ====\n");
    selection_sort(sample_list, int_compar); // Sorts the list

    printf("List sorted:\n");
    for_all(sample_list, int_print, NULL); // prints the list
    printf("\n");
    printf("lenght: %d\n", list_length(sample_list));

    remove_item(sample_list, 3, int_dealloc);
    pop_front(sample_list, int_dealloc);
    pop_back(sample_list, int_dealloc);

    printf("\n");
    printf("==== Deleting ====\n");
    printf("Some element removed:\n");
    for_all(sample_list, int_print, NULL); // prints the list
    printf("\n");
    printf("lenght: %d\n", list_length(sample_list));

    free_list(sample_list, int_dealloc); // frees the memory
    printf("\n");
    printf("==== Demo finished :) ====\n");
    return 0;
}
