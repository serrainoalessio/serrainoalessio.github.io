#ifndef LIST_H
#define LIST_H

struct _dlist_t; // prototype
struct _dlist_t {
  struct _dlist_t * next;
  struct _dlist_t * prev;
  void * data;
};
typedef struct _dlist_t _dlist_t;
typedef _dlist_t* dlist_t;

void _add_item(dlist_t * list, int pos, void* (*allocator)(void *), void * args);
void _remove_item(dlist_t * list, int pos, void (*destructor)(void*));
                                     // destructor takes as argument the item to delete
size_t _list_length(const dlist_t * list); // returns the lenght of the list
void _free_list(dlist_t * list, void (*destructor)(void*));

/* Algorithms */
void _for_all(const dlist_t * list, void (*operation)(const void*, void*), void * args);
        // executes an action for each (like print the item)
int _all_of(const dlist_t * list, int (*operation)(const void*, void*), void * args);
        // verifies a certian property is true for ALL the elements
int _not_all_of(const dlist_t * list, int (*operation)(const void*, void*), void * args);
        // verifies a certian property is true for NONE OR (SOME AND NOT ALL) the elements
int _any_of(const dlist_t * list, int (*operation)(const void*, void*), void * args);
        // verifies a certian property is true for AT LEAST ONE of the elements 
int _none_of(const dlist_t * list, int (*operation)(const void*, void*), void * args);
        // verifies a certian property is true for NONE of the elements
int _how_many_of(const dlist_t * list, int (*operation)(const void*, void*), void * args);
        // counts how many elements verifies a certian property

int _search(const dlist_t * list, const void* key, int (*compar)(const void*, const void*));
        // searches an element. If found returns its id, otherwise returns -1
void _selection_sort(dlist_t * list, int (*compar)(const void*, const void*)); // sorts the list
        // this algorithm may be pretty fast on this kind of list

/* ============== DEBUG PURPOSE ============== */
void __fprint_tree__(FILE * fp, const dlist_t * list);

// define some useful macros:
#define add_item(list, pos, allocator, args) _add_item(&(list), pos, allocator, args)
#define remove_item(list, pos, destructor) _remove_item(&(list), pos, destructor)

// very useful !!!
#define push_back(list, allocator, args) add_item(list, -1, allocator, args)
#define pop_back(list, destructor) remove_item(list, -1, destructor)
#define push_front(list, allocator, args) add_item(list, 0, allocator, args)
#define pop_front(list, destructor) remove_item(list, 0, destructor)

#define list_length(list) _list_length(&(list))
#define free_list(list, destructor) _free_list(&(list), destructor)

#define for_all(list, op, args) _for_all(&(list), op, args)
#define all_of(list, op, args)  _all_of(&(list), op, args)
#define not_all_of(list, op, args)  _all_of(&(list), op, args)
#define any_of(list, op, args)  _any_of(&(list), op, args)
#define none_of(list, op, args) _none_of(&(list), op, args)
#define how_many_of(list, op, args)  _how_many_of(&(list), op, args)

#define search(list, key, compar)    _search(&(list), key, compar)
#define selection_sort(list, compar) _selection_sort(&(list), compar)

#endif // LIST_H defined
