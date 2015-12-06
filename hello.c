#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <fcntl.h>
#include <errno.h>
#include <asm-generic/errno-base.h>
#include <sys/stat.h>
#include <unistd.h>

int main(int argc, char * argv) {
    char fifo[] = "./tmpinfo"; // stack allocated
    char *wd = getcwd(NULL, 0); // heap allocatet
    // (warning getcwd return's value is non-standard, GNU extension)
    printf("%s\n", wd);
    fflush(stdout);
    free(wd);
    
createfifo:
    
    if (mkfifo(fifo, 0666)) {
        if (errno == EEXIST) {
            // file exist, remove and try creating it again
            // (or, may be better, use the already present file)
            fprintf(stderr, "File exist, deleting and creating new\n");
            unlink(fifo);
            goto createfifo;
        }
        fprintf(stderr, "Cannot create fifo\n");
        // N.B. errno is set appropriately
        exit(1);
    }
        
    if (fork() == 0) { // parent process
        int fd;
        char * msg = "Hello world\n";
        fd = open(fifo, O_WRONLY);
        write(fd, msg, sizeof(msg));
        close(fd);
        unlink(fifo);
    } else {
        int fd;
        char * buffer;
        buffer = (char*) malloc(100*sizeof(*buffer)); // allocs 100 chars
        if (buffer == NULL) {
            fprintf(stderr, "could not allocate buffer");
            exit(1);
        }
        fd = open(fifo, O_RDONLY);
        read(fd, buffer, 100);
        printf("%s", buffer);
        fflush(stdout);
        close(fd);
        free(buffer);
    }
    return 0;
}
