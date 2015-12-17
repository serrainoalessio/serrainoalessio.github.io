#include <stdio.h>
#include <gmp.h>
#include "list.h"

void cp_helper(void * destination, const void * source) {
  // Must init destination
  mpz_init_set(*(mpz_t*)destination, *(mpz_t*)source);
}

void destructor_helper(void * item) {
  mpz_clear(*(mpz_t*)item);
}

int main(int argc, char * argv[]) {
  array_t sample_array;
  mpz_t sample;
  array_init(&sample_array, 0, sizeof(sample));

  mpz_init_set_ui(sample, 10);
  array_add(&sample_array, cp_helper, &sample);
  mpz_clear(sample);
  __fprint_array__(stdout, &sample_array);
  array_iterator_t i; // iterator for the list
  
  printf("%p\n", array_begin(&sample_array));
  printf("%p\n", array_end(&sample_array));
  for (i = array_begin(&sample_array);
       i != array_end(&sample_array);
       iterator_next(&sample_array, &i)) {
    gmp_printf("Num: %Zd\n", *(mpz_t*)i);
  }
  array_clear(&sample_array, destructor_helper);
  return 0;
}
