/*
    Probabilità di essere estratti da un libro
    Copyright (c) 2016 Alessio Serraino
    
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

#include <stdio.h>
#include <stdlib.h>
#include <math.h>

__attribute__((const))
int d_sum(int n) { // digit sum
	int s = 0;
	do {
		s += (n%10);
	} while (n = n / 10);
	return s;
}

__attribute__((const))
int dl_sum(int n, int lim) { // digit sum with limit
	int sum = n;
	while (sum > lim) {
		sum = d_sum(n);
		n = sum;
	}
	return sum;
}

__attribute__((const))
double distribution(int min, int n, int max) { // calculates a gaussian kernel
	double midp = (min+max)/2;
	return exp(-2*M_PI*pow((double)n - midp, 2)/(pow(max-min,2)));
}

int main() {
	int num, pags;
	int i, extract; // counter
	double * ch; // total probability
	double temp, total;
	
	printf("Quanti siete in classe?\n");
	scanf("%d", &num);
	ch = calloc(num, sizeof(*ch)); // inits all elements to 0
	printf("Quante pagine ha il libro?\n");
	scanf("%d", &pags);
	
	total = 0.0;
	for (i = 1; i < pags+1; i++) { // suppose extract i-th page
		extract = dl_sum(i, num); // may nevere extract 0
		temp = distribution(1, i, pags); // calculates probability of the extraction of the i-th page
		ch[extract-1] += temp; // adds the probability to the extracted number
		total += temp; // keeps a total of probabilities
	}
	
	// normalize the results, i.e. the sum of all the probabilityes must be 1
	for (i = 0; i < num; i++)   ch[i] /= total;
	
	for (i = 0; i < num; i++)
		printf("Num: %d, probability: %.3lf%%\n", i+1, ch[i]*100);
	
	free(ch);
	
	return 0;
}
