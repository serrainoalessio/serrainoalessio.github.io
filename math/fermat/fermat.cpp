#include <iostream>
#include <vector>
#include <gmpxx.h>



int main() { // no args needed
  mpz_class num, mod;
  std::vector<std::pair<mpz_class, int>> table;
    
  std::cout << "Inserisci un numero: ";
  std::cin >> num;
  std::cout << "Il numero inserito è: " << num << std::endl;
    
  std::cout << "Inserisci un modulo (Es. 18): ";
  std::cin >> mod;

  for (int i = 0; i < mod; i++) {
    //table.push_back(i*i % mod);
  }

  for (int i = 0; i < mod; i++)
    std::cout << table[i] << std::endl;
    
  return 0;
}
