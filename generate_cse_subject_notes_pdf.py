import os
import html
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.pdfgen import canvas

# Complete CSE Subject Syllabus & 5-Unit Detailed Content Compendium
CSE_SUBJECTS_DATA = [
    {
        "filename": "Programming_in_C_Complete_Notes.pdf",
        "title": "Programming in C",
        "code": "23CS101",
        "semester": "1-1",
        "overview": "Comprehensive foundation in procedural programming, algorithmic problem solving, memory manipulation, and low-level data representations.",
        "units": [
            {
                "num": "Unit 1",
                "title": "Introduction to Algorithms, C Basics, and Control Structures",
                "topics": "Algorithms, Flowcharts, Structure of C Program, Data Types, Operators, Type Casting, Conditional Statements (if-else, switch-case), Iterative Loops (for, while, do-while), break/continue statements.",
                "details": "Procedural programming principles in C emphasize structured decomposition. Variables define storage locations with specific bit allocations. Type conversions can be implicit (coercion) or explicit. Control flow is evaluated using boolean truthiness (non-zero is true). Short-circuit logic optimizes logical operations in condition checks.",
                "code_example": '#include <stdio.h>\nint main() {\n    int n = 10, sum = 0;\n    for(int i = 1; i <= n; i++) {\n        sum += i;\n    }\n    printf("Sum of first %d natural numbers = %d\\n", n, sum);\n    return 0;\n}',
                "exam_qa": [
                    ("Q1: Explain the fundamental compilation phases of a C program.", "A: Preprocessing (macro expansion & header inclusion), Compilation (C code to assembly), Assembly (assembly to machine object code), and Linking (resolving external references & library linkage)."),
                    ("Q2: Differentiate between while and do-while loops with syntax.", "A: 'while' is an entry-controlled loop evaluating condition before execution; 'do-while' is exit-controlled, ensuring the body executes at least once before evaluating the condition.")
                ]
            },
            {
                "num": "Unit 2",
                "title": "Functions, Scope, and Storage Classes",
                "topics": "Function Prototypes, Call by Value vs Call by Reference, Recursion, Base Conditions, Variable Scope (Local, Global), Storage Classes (auto, register, static, extern).",
                "details": "Functions provide modularity and code reuse. Recursive functions require a well-defined base case to avoid stack overflow. Storage classes dictate the scope, lifetime, and default initial value of variables. 'static' variables retain values between successive function calls.",
                "code_example": 'int factorial(int n) {\n    if (n <= 1) return 1; // Base case\n    return n * factorial(n - 1); // Recursive step\n}',
                "exam_qa": [
                    ("Q1: What are storage classes in C? Compare static and extern.", "A: Storage classes define scope and lifetime. 'static' keeps a variable alive throughout execution within file/function scope. 'extern' references a global variable defined across compilation units.")
                ]
            },
            {
                "num": "Unit 3",
                "title": "Arrays, Strings, and Pointer Fundamentals",
                "topics": "1D and 2D Arrays, Matrix Operations, Character Arrays, String Manipulation (string.h functions), Pointer Arithmetic, Pointers to Arrays, Pointer to Functions.",
                "details": "Arrays represent contiguous memory blocks. Pointers hold memory addresses; pointer arithmetic operates in multiples of the base data type's byte size. Dynamic string handling relies on null-terminators ('\\0').",
                "code_example": 'void swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}',
                "exam_qa": [
                    ("Q1: Explain pointer arithmetic and memory addressing in C.", "A: Adding an integer k to a pointer (ptr + k) increments the memory address by k * sizeof(*ptr) bytes, ensuring precise indexing in array structures.")
                ]
            },
            {
                "num": "Unit 4",
                "title": "Structures, Unions, and Dynamic Memory Allocation",
                "topics": "struct Declaration, Access Operators, Nested Structures, Array of Structures, union vs struct, Bitfields, DMA functions: malloc(), calloc(), realloc(), free(), Memory Leaks & Dangling Pointers.",
                "details": "Structures group heterogeneous data elements with distinct memory addresses. Unions share a single memory space equal to the largest member. Dynamic memory allocation operates on the heap via malloc/calloc; unreferenced allocations without free() cause memory leaks.",
                "code_example": 'struct Student {\n    int roll;\n    char name[50];\n    float gpa;\n};\nstruct Student *s = (struct Student*)malloc(sizeof(struct Student));',
                "exam_qa": [
                    ("Q1: Differentiate between malloc() and calloc().", "A: malloc(size) allocates uninitialized raw bytes; calloc(n, size) allocates memory for n elements and initializes all bytes to zero.")
                ]
            },
            {
                "num": "Unit 5",
                "title": "File Handling and Preprocessor Directives",
                "topics": "Streams (stdin, stdout, stderr), File Open Modes (r, w, a, r+, rb, wb), Text vs Binary Files, Formatted I/O (fprintf, fscanf), Block I/O (fread, fwrite), Preprocessor Directives (#define, #include, #ifdef), Command Line Arguments (argc, argv).",
                "details": "File operations interact with disk buffers via FILE pointers. Binary modes ('rb', 'wb') bypass OS character translation. Command line arguments enable runtime parameterization from shell prompts.",
                "code_example": 'FILE *fp = fopen("data.txt", "w");\nif(fp != NULL) {\n    fprintf(fp, "PBR VITS CSE Department\\n");\n    fclose(fp);\n}',
                "exam_qa": [
                    ("Q1: What are command line arguments in C? Explain argc and argv.", "A: 'argc' contains the argument count including executable name. 'argv' is an array of string pointers pointing to each argument passed at program launch.")
                ]
            }
        ]
    },
    {
        "filename": "Data_Structures_Complete_Notes.pdf",
        "title": "Data Structures & Algorithms",
        "code": "23CS102",
        "semester": "1-2",
        "overview": "Fundamental data organization structures, time/space asymptotic analysis, linear and non-linear data structures, searching, sorting, and hashing techniques.",
        "units": [
            {
                "num": "Unit 1",
                "title": "Asymptotic Analysis & Linear Lists",
                "topics": "Big-O, Omega, Theta Notations, Space Complexity, Arrays as ADT, Singly Linked List, Doubly Linked List, Circular Linked List, Polynomial Representation & Addition.",
                "details": "Asymptotic notations bound algorithmic efficiency as input size grows to infinity. Linked lists provide dynamic resizing and constant time O(1) insertions/deletions at known node positions, overcoming fixed array contiguous memory limitations.",
                "code_example": 'struct Node {\n    int data;\n    struct Node *next;\n};\n// Insertion at head: O(1) time',
                "exam_qa": [
                    ("Q1: Compare Singly Linked List vs Doubly Linked List.", "A: SLL uses one pointer (next) per node saving memory; DLL uses two pointers (prev & next) enabling bidirectional traversal and O(1) node deletion given its pointer.")
                ]
            },
            {
                "num": "Unit 2",
                "title": "Stacks and Queues ADTs",
                "topics": "Stack Operations (Push, Pop, Peek), Infix to Postfix Conversion, Postfix Evaluation, Queue ADT, Circular Queue, Deque (Double Ended Queue), Priority Queue.",
                "details": "Stacks operate on LIFO (Last-In-First-Out); used for function call stacks and syntax parsing. Standard Linear Queues suffer from false overflow due to index shifting; Circular Queues resolve this using modulo arithmetic (rear + 1) % capacity.",
                "code_example": 'int isFull() { return (rear + 1) % CAPACITY == front; }\nint isEmpty() { return front == -1; }',
                "exam_qa": [
                    ("Q1: Explain how an arithmetic infix expression is converted to postfix.", "A: Operands are appended directly to output; operators are pushed to stack based on precedence and associativity. Parentheses enforce evaluation grouping.")
                ]
            },
            {
                "num": "Unit 3",
                "title": "Trees, Binary Search Trees & Balanced Trees",
                "topics": "Binary Tree Terminology, Tree Traversals (Inorder, Preorder, Postorder, Level-order), Binary Search Tree (BST) Operations, AVL Trees (LL, RR, LR, RL Rotations), B-Trees, Threaded Binary Trees.",
                "details": "Binary Search Trees enforce left < root < right ordering. Skewed BSTs degrade to O(N) operations. AVL Trees maintain balance factor in {-1, 0, 1} through rotations, guaranteeing O(log N) worst-case search, insertion, and deletion time.",
                "code_example": '// Inorder traversal yields sorted output for BST\nvoid inorder(Node *root) {\n    if (root != NULL) {\n        inorder(root->left);\n        printf("%d ", root->val);\n        inorder(root->right);\n    }\n}',
                "exam_qa": [
                    ("Q1: Explain AVL Tree rotations with diagrams.", "A: Single rotations (LL, RR) fix simple imbalance; Double rotations (LR = Left on left-child then Right on root, RL = Right on right-child then Left on root) restore height balance.")
                ]
            },
            {
                "num": "Unit 4",
                "title": "Graphs and Traversal Algorithms",
                "topics": "Graph Representation (Adjacency Matrix, Adjacency List), Breadth First Search (BFS), Depth First Search (DFS), Topological Sorting, Spanning Trees (Prim's & Kruskal's Algorithms), Shortest Paths (Dijkstra's).",
                "details": "Graphs represent non-linear relationships. BFS uses a Queue for level-wise shortest paths on unweighted graphs; DFS uses a Stack/Recursion. Prim's algorithm grows a tree node-by-node, while Kruskal's selects lowest weight edges using Disjoint Set Union (DSU).",
                "code_example": '// Dijkstra shortest path: PriorityQueue based greedy relaxation\nif (dist[u] + weight < dist[v]) {\n    dist[v] = dist[u] + weight;\n}',
                "exam_qa": [
                    ("Q1: Differentiate between BFS and DFS with their time complexities.", "A: Both run in O(V + E) with adjacency lists. BFS explores neighbors level-by-level using a queue; DFS explores branches as deep as possible before backtracking using a stack.")
                ]
            },
            {
                "num": "Unit 5",
                "title": "Searching, Sorting & Hashing Techniques",
                "topics": "Binary Search, Quick Sort (Partitioning), Merge Sort (Divide & Conquer), Heap Sort, Hash Tables, Hash Functions (Division, Folding), Collision Resolution (Chaining, Linear Probing, Quadratic Probing, Double Hashing).",
                "details": "Merge sort guarantees O(N log N) worst case with O(N) auxiliary space. Quick sort achieves O(N log N) average case with in-place partitioning. Hash tables achieve average O(1) search/insert by mapping keys to array indices; collisions are handled by chaining or open addressing.",
                "code_example": 'int hash(int key) { return key % TABLE_SIZE; }\n// Linear Probing: index = (hash(key) + i) % TABLE_SIZE',
                "exam_qa": [
                    ("Q1: Explain collision resolution using Separate Chaining and Open Addressing.", "A: Chaining stores colliding entries in a linked list at that bucket. Open addressing searches for alternate vacant slots within the primary hash table array.")
                ]
            }
        ]
    },
    {
        "filename": "Database_Management_Systems_Complete_Notes.pdf",
        "title": "Database Management Systems (DBMS)",
        "code": "23CS201",
        "semester": "2-1",
        "overview": "Relational data model, SQL queries, normalization, ACID transaction processing, concurrency control, and indexing strategies.",
        "units": [
            {
                "num": "Unit 1",
                "title": "Introduction to Database Systems & ER Modeling",
                "topics": "Database Architecture, 3-Schema Architecture, Data Independence, Entity-Relationship (ER) Model, Entity Types, Relationship Constraints (Cardinality, Participation), Enhanced ER (EER) Specialization/Generalization.",
                "details": "DBMS abstracts physical storage from application logic through physical and logical data independence. ER modeling constructs conceptual schematics using entities, attributes (composite, multi-valued, derived), and relationship cardinalities.",
                "code_example": 'CREATE TABLE Department (\n    dept_id INT PRIMARY KEY,\n    dept_name VARCHAR(100) NOT NULL\n);',
                "exam_qa": [
                    ("Q1: Explain 3-Schema Architecture and Data Independence.", "A: Physical (internal), Conceptual (logical), and External (view) levels. Logical independence protects views from schema changes; Physical independence shields schema from storage hardware changes.")
                ]
            },
            {
                "num": "Unit 2",
                "title": "Relational Model, Relational Algebra & SQL",
                "topics": "Relational Model Concepts, Integrity Constraints (Primary Key, Foreign Key, Domain, Referential), Relational Algebra Operators (Select, Project, Join, Union, Difference), Complex SQL Queries, Joins, Aggregation, Nested Subqueries, Views.",
                "details": "Relational algebra provides procedural foundation for relational query execution. Referential integrity guarantees that foreign key values match valid primary keys in parent tables.",
                "code_example": 'SELECT d.dept_name, COUNT(s.id) as student_count\nFROM Department d\nJOIN Student s ON d.dept_id = s.dept_id\nGROUP BY d.dept_name\nHAVING COUNT(s.id) > 50;',
                "exam_qa": [
                    ("Q1: Explain different types of SQL Joins with examples.", "A: INNER JOIN returns matching rows; LEFT JOIN returns all left rows plus matched right rows; RIGHT JOIN returns all right rows; FULL OUTER JOIN returns all rows from both tables.")
                ]
            },
            {
                "num": "Unit 3",
                "title": "Functional Dependencies & Relational Normalization",
                "topics": "Anomalies in Unnormalized Tables (Insertion, Deletion, Update), Functional Dependencies (Armstrong Axioms), 1NF, 2NF (Full FD), 3NF (Transitive FD Elimination), BCNF (Strict Determinant Rule), Multi-Valued Dependencies & 4NF.",
                "details": "Normalization reduces data redundancy and eliminates update anomalies without information loss. A table is in 3NF if for every X -> Y, X is a superkey or Y is prime. BCNF strictly requires X to be a superkey for every non-trivial FD.",
                "code_example": '-- BCNF condition: For all X -> Y, X must be a candidate key',
                "exam_qa": [
                    ("Q1: Differentiate between 3NF and BCNF with a suitable scenario.", "A: 3NF permits non-superkey determinants if the dependent attribute is prime. BCNF strictly forbids non-superkey determinants, eliminating all functional redundancy.")
                ]
            },
            {
                "num": "Unit 4",
                "title": "Transaction Processing and Concurrency Control",
                "topics": "ACID Properties (Atomicity, Consistency, Isolation, Durability), Transaction States, Serializability (Conflict & View), Recoverability, Lock-Based Protocols (2-Phase Locking - 2PL, Strict 2PL), Deadlock Handling (Prevention, Detection, Wait-Die, Wound-Wait), Timestamp-Based Ordering.",
                "details": "Transactions are atomic units of execution. Concurrency control guarantees isolation. 2-Phase Locking ensures conflict serializability by dividing locks into Growing (acquiring locks) and Shrinking (releasing locks) phases.",
                "code_example": 'BEGIN TRANSACTION;\nUPDATE Accounts SET balance = balance - 500 WHERE id = 101;\nUPDATE Accounts SET balance = balance + 500 WHERE id = 102;\nCOMMIT;',
                "exam_qa": [
                    ("Q1: Explain ACID properties in DBMS with real-world banking examples.", "A: Atomicity (all-or-nothing transfer), Consistency (total money remains constant), Isolation (intermediate states hidden from concurrent users), Durability (committed data persists despite server crash).")
                ]
            },
            {
                "num": "Unit 5",
                "title": "Storage, Indexing, and Query Optimization",
                "topics": "File Organization (Heap, Sequential, Hash), Primary Index, Secondary Index, Clustering Index, B-Tree and B+ Tree Indexing Structure, Query Processing Steps, Cost Estimation, Heuristic Query Optimization.",
                "details": "B+ Trees provide balanced multi-level indexing where all data records/pointers reside at leaf nodes linked sequentially, facilitating both random point lookups and high-speed range scans in O(log N) disk I/O operations.",
                "code_example": 'CREATE INDEX idx_student_dept ON Student(dept_id, semester);',
                "exam_qa": [
                    ("Q1: Why are B+ Trees preferred over B-Trees for database indexing?", "A: Leaf nodes in B+ Trees are linked sequentially for fast range scans; internal nodes store only routing keys, yielding higher fan-out and shallower tree depths.")
                ]
            }
        ]
    },
    {
        "filename": "Operating_Systems_Complete_Notes.pdf",
        "title": "Operating Systems",
        "code": "23CS202",
        "semester": "2-2",
        "overview": "Core operating system abstractions: process lifecycle, CPU scheduling, synchronization primitives, deadlocks, virtual memory management, and file systems.",
        "units": [
            {
                "num": "Unit 1",
                "title": "Operating System Architecture & Process Management",
                "topics": "OS Roles, System Calls (fork, exec, wait), Monolithic vs Microkernel, Process Control Block (PCB), Process States, Context Switching, Inter-Process Communication (Pipes, Shared Memory, Message Queues), Multithreading Models.",
                "details": "The kernel manages hardware abstraction and hardware privilege levels (User Mode vs Kernel Mode). A Process is a program in execution containing code, stack, heap, and PCB registers.",
                "code_example": 'pid_t pid = fork();\nif (pid == 0) {\n    // Child Process\n} else if (pid > 0) {\n    wait(NULL); // Parent Process\n}',
                "exam_qa": [
                    ("Q1: Explain the components of a Process Control Block (PCB).", "A: Process ID (PID), Process State, Program Counter (PC), CPU Registers, CPU Scheduling Info, Memory Management Limits, and Open File Descriptors.")
                ]
            },
            {
                "num": "Unit 2",
                "title": "CPU Scheduling Algorithms",
                "topics": "Scheduling Criteria (Throughput, Turnaround, Waiting, Response Times), First-Come First-Served (FCFS), Shortest Job First (SJF / SRTF), Round Robin (RR), Priority Scheduling, Multi-Level Feedback Queue (MLFQ).",
                "details": "SJF is provably optimal for minimizing average waiting time but requires future burst predictions. Round Robin guarantees fairness and bounded response times using fixed time quantum slices.",
                "code_example": '// Average Waiting Time = (Sum of all Waiting Times) / N\n// Turnaround Time = Completion Time - Arrival Time',
                "exam_qa": [
                    ("Q1: Explain the Convoy Effect in FCFS scheduling.", "A: When a large CPU-intensive process holds the processor, shorter I/O-bound processes queue behind it, drastically lowering overall CPU and device utilization.")
                ]
            },
            {
                "num": "Unit 3",
                "title": "Process Synchronization & Deadlocks",
                "topics": "Critical Section Problem, Mutual Exclusion, Peterson's Solution, Hardware Instructions (TestAndSet), Semaphores (Counting, Binary), Mutex Locks, Classical Problems (Producer-Consumer, Dining Philosophers, Readers-Writers), Deadlock Characterization (Coffman Conditions), Banker's Algorithm.",
                "details": "The Critical Section requires Mutual Exclusion, Progress, and Bounded Waiting. Deadlocks require 4 simultaneous conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.",
                "code_example": 'sem_wait(&mutex);\n// Critical Section\nsem_post(&mutex);',
                "exam_qa": [
                    ("Q1: State and explain Banker's Algorithm for deadlock avoidance.", "A: It evaluates resource allocation requests against available matrices, granting resources only if the resulting system state remains in a Safe State where all processes can finish.")
                ]
            },
            {
                "num": "Unit 4",
                "title": "Memory Management & Virtual Memory",
                "topics": "Contiguous Allocation, Paging, Page Table Structure, Translation Lookaside Buffer (TLB), Segmentation, Virtual Memory, Demand Paging, Page Faults, Page Replacement Algorithms (FIFO, Optimal, LRU), Thrashing & Working Set Model.",
                "details": "Paging eliminates external fragmentation by partitioning virtual memory into fixed Pages and physical memory into Frames. The TLB caches address translations for single-cycle memory access.",
                "code_example": '// Logical Address: [ Page Number (p) | Offset (d) ]\n// Physical Address: [ Frame Number (f) | Offset (d) ]',
                "exam_qa": [
                    ("Q1: Explain Thrashing and how the Working Set Model resolves it.", "A: Thrashing occurs when CPU spends more time swapping pages than executing code. The Working Set Model monitors active pages per process, suspending processes if total memory exceeds physical capacity.")
                ]
            },
            {
                "num": "Unit 5",
                "title": "File Systems & Disk Scheduling",
                "topics": "File Attributes & Operations, Directory Structures, File Allocation Methods (Contiguous, Linked, Indexed / Inode), Free Space Management (Bitmaps), Disk Structure, Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK), RAID Levels.",
                "details": "Inodes in UNIX contain file metadata and direct/indirect block pointers. Disk scheduling algorithms minimize mechanical seek head movement across magnetic platters.",
                "code_example": '// C-SCAN services requests in one direction, then jumps back to the beginning without servicing returns',
                "exam_qa": [
                    ("Q1: Compare SCAN and C-SCAN disk scheduling algorithms.", "A: SCAN travels edge-to-edge servicing requests in both directions. C-SCAN services requests in only one direction and returns immediately to the start, providing more uniform waiting times.")
                ]
            }
        ]
    },
    {
        "filename": "Computer_Networks_Complete_Notes.pdf",
        "title": "Computer Networks",
        "code": "23CS301",
        "semester": "3-1",
        "overview": "OSI & TCP/IP reference architectures, packet switching, error control, routing protocols, transport reliability, congestion control, and network application protocols.",
        "units": [
            {
                "num": "Unit 1",
                "title": "Network Models & Physical Layer",
                "topics": "OSI 7-Layer Model vs TCP/IP Protocol Suite, Transmission Media (Twisted Pair, Fiber Optics, Wireless), Data Encoding, Multiplexing (FDM, TDM, WDM), Switching (Circuit vs Packet Switching), Latency, Bandwidth-Delay Product.",
                "details": "Layered architectures modularize networking responsibilities from physical bit transmission up to end-user application semantics. Packet switching routes discrete chunks independently across shared links.",
                "code_example": '// OSI Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application',
                "exam_qa": [
                    ("Q1: Compare OSI Model and TCP/IP Model.", "A: OSI is a 7-layer theoretical reference framework with strict layer boundaries; TCP/IP is a 4-layer practical protocol architecture that powers the modern Internet.")
                ]
            },
            {
                "num": "Unit 2",
                "title": "Data Link Layer & Medium Access Control (MAC)",
                "topics": "Framing, Error Detection (Parity, Checksum, CRC), Error Correction (Hamming Codes), Flow Control (Stop-and-Wait, Sliding Window Go-Back-N, Selective Repeat), Random Access Protocols (ALOHA, CSMA/CD, CSMA/CA), Ethernet & IEEE 802.11 WiFi.",
                "details": "Data Link Layer manages node-to-node frame transfer over a single link. CRC uses polynomial binary division for reliable burst error detection. CSMA/CD senses carrier before transmitting and aborts on collision.",
                "code_example": '// CRC Generation: Divide data polynomial D(x)*x^r by generator G(x)',
                "exam_qa": [
                    ("Q1: Explain CSMA/CD mechanism and how collisions are handled in Ethernet.", "A: A station listens before transmitting. If collision occurs while sending, it broadcasts a jam signal, stops, and executes Binary Exponential Backoff before retransmitting.")
                ]
            },
            {
                "num": "Unit 3",
                "title": "Network Layer & Routing Protocols",
                "topics": "IPv4 vs IPv6 Addressing, Subnetting & CIDR, Address Resolution Protocol (ARP), Dynamic Host Configuration (DHCP), ICMP, Routing Algorithms (Distance Vector - Bellman Ford, Link State - Dijkstra), Intra-domain (OSPF, RIP) vs Inter-domain Routing (BGP), NAT.",
                "details": "Network layer provides end-to-end host addressing and packet routing across heterogeneous networks. CIDR eliminates rigid address classes using variable length prefix masks (/24, /16).",
                "code_example": '// Subnet mask calculation: /26 -> 255.255.255.192 (64 addresses per subnet)',
                "exam_qa": [
                    ("Q1: Explain Count-to-Infinity problem in Distance Vector Routing and its solution.", "A: It occurs when a link breaks and nodes slowly increment routing metrics. Solutions include Split Horizon and Poison Reverse.")
                ]
            },
            {
                "num": "Unit 4",
                "title": "Transport Layer Protocols & Congestion Control",
                "topics": "User Datagram Protocol (UDP), Transmission Control Protocol (TCP), 3-Way Handshake Connection Establishment, TCP Teardown, TCP Sliding Window Flow Control, Congestion Control (Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery).",
                "details": "Transport layer provides logical process-to-process communication using Port numbers. TCP guarantees reliable, in-order byte stream delivery with dynamic congestion window management (AIMD).",
                "code_example": '// TCP 3-Way Handshake: SYN -> SYN-ACK -> ACK',
                "exam_qa": [
                    ("Q1: Differentiate between TCP and UDP with header structures and use cases.", "A: TCP is connection-oriented, reliable, with flow/congestion control (20-byte header; used for HTTP, SSH). UDP is connectionless, lightweight, and low-latency (8-byte header; used for DNS, VoIP, streaming).")
                ]
            },
            {
                "num": "Unit 5",
                "title": "Application Layer & Network Security",
                "topics": "Domain Name System (DNS), HTTP/1.1 vs HTTP/2 vs HTTP/3, HTTPS & TLS Handshake, Email Protocols (SMTP, POP3, IMAP), Symmetric/Asymmetric Encryption, Digital Signatures, Firewalls & VPNs.",
                "details": "Application layer protocols define syntax and message exchanges between client and server applications. HTTPS encrypts HTTP traffic via TLS symmetric session keys exchanged during asymmetric handshake.",
                "code_example": 'GET /index.html HTTP/1.1\nHost: pbrvits.ac.in\nUser-Agent: StudentCompanion/1.0',
                "exam_qa": [
                    ("Q1: Explain the recursive and iterative DNS resolution workflow.", "A: Client queries Local DNS. In recursive resolution, the server resolves all referrals; in iterative resolution, root/TLD servers return next authoritative name server referrals to the resolver.")
                ]
            }
        ]
    },
    {
        "filename": "Design_Analysis_Algorithms_Complete_Notes.pdf",
        "title": "Design & Analysis of Algorithms (DAA)",
        "code": "23CS302",
        "semester": "3-1",
        "overview": "Algorithmic paradigms, divide-and-conquer, greedy optimizations, dynamic programming, backtracking, branch-and-bound, and NP-completeness.",
        "units": [
            {
                "num": "Unit 1",
                "title": "Algorithm Framework & Divide-and-Conquer",
                "topics": "Performance Analysis, Recurrence Relations (Master Theorem, Substitution, Recursion Tree), Divide and Conquer: Binary Search, Merge Sort, Quick Sort (Best/Worst case), Strassen's Matrix Multiplication.",
                "details": "Master Theorem provides closed-form asymptotic solutions for divide-and-conquer recurrences T(n) = aT(n/b) + f(n). Strassen reduces matrix multiplication from O(n^3) to O(n^2.81) using 7 recursive sub-matrix multiplications.",
                "code_example": '// Master Theorem: If f(n) = Theta(n^c) where c = log_b(a), then T(n) = Theta(n^c * log n)',
                "exam_qa": [
                    ("Q1: Solve T(n) = 2T(n/2) + n using Master Theorem.", "A: Here a=2, b=2, log_b(a) = log_2(2) = 1. Since f(n) = n = Theta(n^1), Case 2 applies: T(n) = Theta(n log n).")
                ]
            },
            {
                "num": "Unit 2",
                "title": "Greedy Method Paradigms",
                "topics": "Greedy Choice Property, Optimal Substructure, Fractional Knapsack, Job Sequencing with Deadlines, Minimum Spanning Trees (Prim's and Kruskal's), Single Source Shortest Path (Dijkstra's), Huffman Coding.",
                "details": "Greedy algorithms make locally optimal decisions at each stage with no backtracking. Huffman coding produces variable-length prefix-free binary codes based on symbol frequency, minimizing compressed bit length.",
                "code_example": '// Fractional Knapsack: Sort items by value/weight ratio in descending order',
                "exam_qa": [
                    ("Q1: Differentiate between Fractional Knapsack (Greedy) and 0/1 Knapsack (DP).", "A: Fractional knapsack allows taking fractions of items (Greedy yields optimal O(N log N) solution); 0/1 knapsack requires discrete decisions, solvable via Dynamic Programming in O(NW) pseudo-polynomial time.")
                ]
            },
            {
                "num": "Unit 3",
                "title": "Dynamic Programming",
                "topics": "Overlapping Subproblems, Optimal Substructure, Memoization vs Tabulation, 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication (MCM), Bellman-Ford Shortest Path, Floyd-Warshall All-Pairs Shortest Path.",
                "details": "Dynamic Programming stores solved subproblem solutions in a table, avoiding redundant exponential recomputations. Floyd-Warshall computes all-pairs shortest paths in O(V^3) time via dynamic matrix updates.",
                "code_example": '// LCS Recurrence:\n// if (X[i] == Y[j]) dp[i][j] = 1 + dp[i-1][j-1];\n// else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);',
                "exam_qa": [
                    ("Q1: Explain Matrix Chain Multiplication (MCM) and write its recurrence.", "A: Computes minimum scalar multiplications to multiply a chain of matrices. Recurrence: m[i,j] = min_{i<=k<j} (m[i,k] + m[k+1,j] + p_{i-1} * p_k * p_j).")
                ]
            },
            {
                "num": "Unit 4",
                "title": "Backtracking & Branch-and-Bound",
                "topics": "State Space Trees, N-Queens Problem, Sum of Subsets, Graph Coloring (m-colorability), Hamiltonian Cycles, Branch and Bound: 0/1 Knapsack, Traveling Salesperson Problem (TSP) with Reduced Cost Matrix.",
                "details": "Backtracking systematically searches state spaces, pruning invalid subtrees when constraints are violated. Branch and Bound uses bounding functions (e.g. lower bounds for minimization) to prune subtrees in optimization problems.",
                "code_example": '// N-Queens: Safe if no queen shares same column or diagonal |row1-row2| == |col1-col2|',
                "exam_qa": [
                    ("Q1: Explain the 4-Queens and 8-Queens backtracking algorithm.", "A: Places queens row by row; if queen at column c conflicts with previous queens diagonally or vertically, the algorithm backtracks to adjust earlier rows.")
                ]
            },
            {
                "num": "Unit 5",
                "title": "NP-Completeness and Approximation Algorithms",
                "topics": "Class P, Class NP, NP-Hard, NP-Complete, Polynomial-Time Reductions, Cook-Levin Theorem, Proving NP-Completeness (3-SAT to Clique to Vertex Cover), Approximation Algorithms (Vertex Cover, Metric TSP).",
                "details": "Class P contains decision problems solvable in polynomial time; NP contains problems verifiable in polynomial time. NP-Complete problems are the hardest problems in NP; if any NPC problem is in P, then P = NP.",
                "code_example": '// Cook-Levin Theorem: SAT (Boolean Satisfiability) is NP-Complete',
                "exam_qa": [
                    ("Q1: Define P, NP, NP-Hard, and NP-Complete with a Euler diagram description.", "A: P: Solvable in O(n^k). NP: Verifiable in O(n^k). NP-Hard: At least as hard as any problem in NP. NP-Complete: In NP and NP-Hard simultaneously.")
                ]
            }
        ]
    },
    {
        "filename": "Generative_AI_Deep_Learning_Complete_Notes.pdf",
        "title": "Generative AI & Deep Learning",
        "code": "23CS401",
        "semester": "4-1",
        "overview": "Deep neural network architectures, backpropagation, Convolutional Networks (CNNs), Transformers, Self-Attention, Large Language Models (LLMs), and Diffusion Models.",
        "units": [
            {
                "num": "Unit 1",
                "title": "Foundations of Deep Learning & Neural Networks",
                "topics": "Perceptrons, Multi-Layer Perceptrons (MLP), Activation Functions (ReLU, Sigmoid, GeLU, Softmax), Forward Propagation, Loss Functions (Cross-Entropy, MSE), Backpropagation & Chain Rule, Optimization (SGD, Momentum, Adam, RMSprop), Regularization (Dropout, Batch Normalization, Weight Decay).",
                "details": "Deep neural networks learn non-linear representations through hierarchical layers. The Adam optimizer dynamically computes adaptive learning rates per parameter using first and second gradient moments.",
                "code_example": 'import torch.nn as nn\nmodel = nn.Sequential(\n    nn.Linear(784, 256),\n    nn.ReLU(),\n    nn.Dropout(0.2),\n    nn.Linear(256, 10)\n)',
                "exam_qa": [
                    ("Q1: Derive the backpropagation weight update equation using the chain rule.", "A: dLoss/dW = (dLoss/dOutput) * (dOutput/dNetInput) * (dNetInput/dW), updating weights via W = W - learning_rate * (dLoss/dW).")
                ]
            },
            {
                "num": "Unit 2",
                "title": "Convolutional Neural Networks (CNNs) & Computer Vision",
                "topics": "Convolution Operation, Strides, Padding, Pooling (Max, Average), Feature Maps, Landmark CNN Architectures (AlexNet, VGG-16, ResNet, MobileNet), Skip Connections & Residual Learning, Object Detection (YOLO, Faster R-CNN), Facial Recognition Embeddings.",
                "details": "CNNs exploit spatial locality through weight sharing and translation invariance. ResNet skip connections resolve vanishing gradients in deep architectures, enabling models with hundreds of layers.",
                "code_example": 'conv_layer = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3, padding=1)',
                "exam_qa": [
                    ("Q1: Why are residual skip connections critical in Deep CNNs?", "A: They allow gradients to flow unimpeded directly through the identity mapping F(x) + x, preventing vanishing gradients and degradation in deep networks.")
                ]
            },
            {
                "num": "Unit 3",
                "title": "Sequential Models, RNNs, and Attention Mechanism",
                "topics": "Recurrent Neural Networks (RNNs), Exploding/Vanishing Gradients, Long Short-Term Memory (LSTM), Gated Recurrent Units (GRU), Sequence-to-Sequence Models, Bahdanau Additive Attention, Luong Multiplicative Attention.",
                "details": "LSTMs introduce Forget, Input, and Output gates with a dedicated Cell State to maintain long-term context across lengthy sequential inputs.",
                "code_example": '// LSTM Cell: f_t = sigma(W_f * [h_{t-1}, x_t] + b_f)',
                "exam_qa": [
                    ("Q1: Explain the gating mechanisms inside an LSTM cell.", "A: Forget Gate decides what information to discard from cell state; Input Gate selects new candidate values to store; Output Gate produces hidden state based on filtered cell state.")
                ]
            },
            {
                "num": "Unit 4",
                "title": "Transformer Architecture & Self-Attention",
                "topics": "Scaled Dot-Product Attention, Multi-Head Attention, Positional Encodings, Encoder-Decoder Stacks, Feed-Forward Networks, Layer Normalization, BERT (Masked LM), GPT (Autoregressive Decoder-Only), Vision Transformers (ViT).",
                "details": "Transformers replace recurrence with self-attention, processing all tokens concurrently. Multi-Head Attention computes Attention(Q,K,V) = softmax(Q K^T / sqrt(d_k)) * V across multiple subspace representations.",
                "code_example": 'Attention(Q, K, V) = softmax((Q @ K.T) / sqrt(d_k)) @ V',
                "exam_qa": [
                    ("Q1: Explain Multi-Head Attention and why scaling by sqrt(d_k) is necessary.", "A: Scaling prevents dot products from growing excessively large for high dimensions, which would otherwise push the softmax function into regions with near-zero gradients.")
                ]
            },
            {
                "num": "Unit 5",
                "title": "Generative Models, LLMs, and Modern GenAI",
                "topics": "Variational Autoencoders (VAEs), Generative Adversarial Networks (GANs), Diffusion Models (DDPM, Stable Diffusion), Large Language Model Pretraining, Instruction Fine-Tuning (RLHF), Parameter Efficient Fine-Tuning (LoRA, QLoRA), Retrieval-Augmented Generation (RAG), Vector Databases.",
                "details": "Generative AI creates novel synthetic text, images, and audio. RAG combines external knowledge vector retrieval with LLM generation to eliminate hallucinations and supply up-to-date domain context.",
                "code_example": '// LoRA adaptation: W_new = W_pretrained + (A @ B) * (alpha / r)',
                "exam_qa": [
                    ("Q1: Explain the architecture and workflow of Retrieval-Augmented Generation (RAG).", "A: User queries are converted to embeddings, matched against a vector database for top-k relevant document chunks, and passed as grounding context into the LLM system prompt.")
                ]
            }
        ]
    },
    {
        "filename": "Cryptography_Network_Security_Complete_Notes.pdf",
        "title": "Cryptography & Network Security",
        "code": "23CS402",
        "semester": "4-1",
        "overview": "Classical and modern cryptographic ciphers, number theory foundations, symmetric encryption, public-key cryptography, digital signatures, hash algorithms, and network defenses.",
        "units": [
            {
                "num": "Unit 1",
                "title": "Security Concepts & Classical Ciphers",
                "topics": "Security Goals (CIA Triad), Threat Models, Active vs Passive Attacks, Substitution Ciphers (Caesar, Playfair, Hill Cipher, Vigenere), Transposition Ciphers, Modular Arithmetic, Euclidean Algorithm, Extended Euclidean Algorithm.",
                "details": "Cryptography protects data Confidentiality, Integrity, and Authenticity. Modular arithmetic provides finite algebraic structures where multiplicative inverses exist iff gcd(a, m) = 1.",
                "code_example": '// Modular Multiplicative Inverse: (a * x) % m == 1',
                "exam_qa": [
                    ("Q1: Differentiate between active and passive security attacks.", "A: Passive attacks (eavesdropping, traffic analysis) monitor data without alteration; Active attacks (masquerade, replay, message modification, DoS) alter system resources or operations.")
                ]
            },
            {
                "num": "Unit 2",
                "title": "Symmetric Encryption (DES & AES)",
                "topics": "Block vs Stream Ciphers, Feistel Cipher Structure, Data Encryption Standard (DES), Triple DES (3DES), Advanced Encryption Standard (AES) Mathematical Operations (SubBytes, ShiftRows, MixColumns, AddRoundKey), Modes of Operation (ECB, CBC, CFB, OFB, CTR).",
                "details": "AES uses substitution-permutation networks over Galois Field GF(2^8). Cipher Block Chaining (CBC) XORs each plaintext block with previous ciphertext block using an Initialization Vector (IV).",
                "code_example": '// CBC Encryption: C_i = Encrypt_K(P_i XOR C_{i-1})',
                "exam_qa": [
                    ("Q1: Explain the 4 transformations in an AES round.", "A: SubBytes (non-linear S-Box substitution), ShiftRows (cyclically shifting row bytes), MixColumns (matrix multiplication in GF(2^8)), AddRoundKey (bitwise XOR with round key).")
                ]
            },
            {
                "num": "Unit 3",
                "title": "Asymmetric Cryptography & Key Management",
                "topics": "Fermat's and Euler's Theorems, Euler's Totient Function, Diffie-Hellman Key Exchange (Man-in-the-Middle Attack), RSA Algorithm (Key Generation, Encryption, Decryption, Security Proof), Elliptic Curve Cryptography (ECC).",
                "details": "Public-key systems rely on trapdoor one-way functions. RSA security relies on the hardness of factoring large composite semiprimes n = p * q.",
                "code_example": '// RSA: Choose primes p, q -> n=p*q, phi=(p-1)*(q-1)\n// e*d = 1 mod phi -> Cipher = (M^e) mod n, Plain = (C^d) mod n',
                "exam_qa": [
                    ("Q1: Perform RSA encryption for p=7, q=11, e=13, Message M=9.", "A: n=77, phi=60. Since 13*37 = 481 = 1 mod 60, d=37. Ciphertext C = (9^13) mod 77 = 4.")
                ]
            },
            {
                "num": "Unit 4",
                "title": "Cryptographic Hash Functions & Digital Signatures",
                "topics": "Cryptographic Hash Properties (Pre-image, Second Pre-image, Collision Resistance), Birthday Paradox, SHA-256 / SHA-512 Architecture, HMAC, Digital Signature Standard (DSS / DSA), PKI (X.509 Certificates, Certificate Authorities).",
                "details": "Hash functions produce deterministic fixed-size digests. Digital signatures encrypt hash digests using the sender's private key, guaranteeing non-repudiation and integrity.",
                "code_example": '// Digital Signature: Signature = Sign_PrivateKey(Hash(Message))\n// Verification: Verify_PublicKey(Signature) == Hash(Message)',
                "exam_qa": [
                    ("Q1: What are the security properties required for a cryptographic hash function?", "A: Pre-image resistance (one-way), Second pre-image resistance (weak collision), and Collision resistance (hard to find any pair x != y with H(x) == H(y)).")
                ]
            },
            {
                "num": "Unit 5",
                "title": "Network & System Security Protocols",
                "topics": "IPsec Architecture (AH, ESP, Tunnel vs Transport Mode), SSL/TLS Protocol Stack & Handshake, PGP for Email Security, Firewalls (Packet Filtering, Stateful Inspection, Application Gateways), Intrusion Detection Systems (IDS), DDoS Mitigation.",
                "details": "IPsec operates at Network Layer providing end-to-end IP packet encryption (ESP) and authentication (AH). Stateful firewalls track active TCP session states to block unsolicited packets.",
                "code_example": '// IPsec Transport Mode: [IP Header | ESP Header | Encrypted Payload | ESP Trailer]',
                "exam_qa": [
                    ("Q1: Differentiate between IPsec Transport Mode and Tunnel Mode.", "A: Transport mode encrypts only the IP payload (host-to-host); Tunnel mode encrypts the entire original IP packet and adds a new outer IP header (gateway-to-gateway VPN).")
                ]
            }
        ]
    },
    {
        "filename": "Cloud_Computing_Complete_Notes.pdf",
        "title": "Cloud Computing & Virtualization",
        "code": "23CS403",
        "semester": "3-2",
        "overview": "Cloud deployment models, virtualization architectures, hypervisors, cloud storage systems, microservices, containerization with Docker & Kubernetes, and serverless computing.",
        "units": [
            {
                "num": "Unit 1",
                "title": "Cloud Computing Principles & Architecture",
                "topics": "NIST Cloud Definition, Essential Characteristics (On-demand Self-Service, Broad Network Access, Resource Pooling, Rapid Elasticity, Measured Service), Service Models (IaaS, PaaS, SaaS), Deployment Models (Public, Private, Hybrid, Community Cloud).",
                "details": "Cloud computing shifts capital expenditure (CapEx) to operational expenditure (OpEx) through shared, elastic multi-tenant infrastructure.",
                "code_example": '// Service Layering: SaaS (Applications) -> PaaS (Runtimes) -> IaaS (Raw Compute/Storage)',
                "exam_qa": [
                    ("Q1: Explain the NIST 5 Essential Characteristics of Cloud Computing.", "A: On-demand self-service, Broad network access, Resource pooling (multi-tenancy), Rapid elasticity (auto-scaling), and Measured service (pay-per-use billing).")
                ]
            },
            {
                "num": "Unit 2",
                "title": "Virtualization Technologies & Hypervisors",
                "topics": "Virtualization Fundamentals, Type-1 (Bare-Metal) vs Type-2 (Hosted) Hypervisors, Full Virtualization (Binary Translation), Paravirtualization (Hypercalls), Hardware-Assisted Virtualization (Intel VT-x), Containerization vs Virtual Machines.",
                "details": "Hypervisors virtualize physical hardware. Containers share the host kernel while isolating namespaces and cgroups, achieving sub-second startup and near-native execution speed.",
                "code_example": '// VM: Guest OS on Hypervisor | Container: App & Dependencies on Shared OS Kernel',
                "exam_qa": [
                    ("Q1: Compare Virtual Machines and Docker Containers.", "A: VMs bundle a complete Guest OS (heavyweight, gigabytes in size, slow boot); Containers share the host OS kernel (lightweight, megabytes in size, instant boot).")
                ]
            },
            {
                "num": "Unit 3",
                "title": "Cloud Storage & Distributed File Systems",
                "topics": "Cloud Storage Architectures (Block Storage, File Storage, Object Storage - S3), CAP Theorem (Consistency, Availability, Partition Tolerance), Distributed Hash Tables (DHT), Consistency Models (Eventual Consistency), Multi-Region Replication.",
                "details": "Object storage stores unstructured data as objects with unique IDs and rich metadata accessed via REST APIs. The CAP theorem states a distributed system can guarantee at most two of C, A, and P.",
                "code_example": '// CAP Theorem: In presence of network partition (P), choose between Consistency (C) or Availability (A)',
                "exam_qa": [
                    ("Q1: Explain CAP theorem in distributed cloud systems.", "A: Network partitions are inevitable in real networks. Systems must choose between Consistency (all nodes return latest data) and Availability (every request receives non-error response).")
                ]
            },
            {
                "num": "Unit 4",
                "title": "Cloud Security, IAM, and Compliance",
                "topics": "Cloud Shared Responsibility Model, Identity and Access Management (IAM), Role-Based Access Control, Cloud Encryption at Rest & In-Transit, Key Management Services (KMS), Security Groups & Network ACLs, Disaster Recovery Strategies.",
                "details": "In the Shared Responsibility Model, the cloud provider secures the cloud infrastructure (hardware, facilities, host virtualization), while the customer secures data, IAM policies, and OS configurations.",
                "code_example": '{\n  "Effect": "Allow",\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::pbrvits-notes/*"\n}',
                "exam_qa": [
                    ("Q1: Explain the Cloud Shared Responsibility Model for IaaS vs SaaS.", "A: In IaaS, provider manages hardware/network, customer manages OS, middleware, and apps. In SaaS, provider manages everything including software; customer only manages data and access credentials.")
                ]
            },
            {
                "num": "Unit 5",
                "title": "Cloud Native, Microservices, and Serverless",
                "topics": "Microservices Architecture vs Monoliths, Docker Containerization, Kubernetes (Pods, Services, Deployments, Auto-scaling), Serverless Computing (Function-as-a-Service - FaaS / AWS Lambda), Event-Driven Architectures, Edge Computing.",
                "details": "Serverless FaaS automatically scales compute functions from zero to thousands of instances based on incoming triggers, eliminating server management overhead and idle costs.",
                "code_example": 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: campus-backend\nspec:\n  replicas: 3',
                "exam_qa": [
                    ("Q1: What is Serverless Computing (FaaS)? State its key benefits.", "A: Event-driven execution model where cloud provider dynamically manages compute allocations. Benefits: Zero idle costs, automatic horizontal scaling, no server maintenance.")
                ]
            }
        ]
    }
]

# Custom Canvas for Header, Footer & Page Numbers
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (Only on page 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, "PBR VITS • Department of Computer Science and Engineering • Academic Notes")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer (On all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "PBR Visvodaya Institute of Technology & Science, Kavali • Smart Campus Companion")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_subject_pdf(subject_info, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, subject_info["filename"])
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#1E3A8A")   # Navy Blue
    c_secondary = colors.HexColor("#0D9488") # Teal
    c_dark = colors.HexColor("#0F172A")      # Slate 900
    c_muted = colors.HexColor("#475569")     # Slate 600
    c_bg_box = colors.HexColor("#F8FAFC")    # Slate 50
    c_border = colors.HexColor("#E2E8F0")    # Slate 200

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=c_primary,
        alignment=1, # Center
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=c_muted,
        alignment=1,
        spaceAfter=15
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=c_secondary
    )

    h1_style = ParagraphStyle(
        'UnitHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_secondary,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=c_dark,
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1E293B")
    )

    qa_q_style = ParagraphStyle(
        'QAQuestion',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#B91C1C")
    )

    qa_a_style = ParagraphStyle(
        'QAAnswer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark
    )

    story = []

    # Title & Metadata Header Box
    story.append(Paragraph(f"PBR VISVODAYA INSTITUTE OF TECHNOLOGY & SCIENCE", meta_style))
    story.append(Paragraph(subject_info["title"].upper(), title_style))
    story.append(Paragraph(f"Course Code: <b>{subject_info['code']}</b> • Semester: <b>{subject_info['semester']}</b> • Department of Computer Science & Engineering", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=2, spaceAfter=10))

    # Overview Box
    ov_content = [
        [Paragraph(f"<b>Course Scope & Objectives:</b> {html.escape(subject_info['overview'])}", body_style)]
    ]
    ov_table = Table(ov_content, colWidths=[504])
    ov_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BFDBFE")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(ov_table)
    story.append(Spacer(1, 12))

    # Render All 5 Units
    for unit in subject_info["units"]:
        story.append(Paragraph(f"{html.escape(unit['num'])}: {html.escape(unit['title'])}", h1_style))
        
        # Syllabus Topics Line
        story.append(Paragraph(f"<b>Key Syllabus Topics:</b> {html.escape(unit['topics'])}", body_style))
        story.append(Paragraph(f"<b>Theoretical Framework & Concepts:</b>", h2_style))
        story.append(Paragraph(html.escape(unit['details']), body_style))

        # Code or Implementation Snippet Box
        if "code_example" in unit and unit["code_example"]:
            story.append(Paragraph(f"<b>Implementation / Key Formula Reference:</b>", h2_style))
            escaped_code = html.escape(unit['code_example']).replace('\n', '<br/>').replace(' ', '&nbsp;')
            code_cell = [[Paragraph(f"<code>{escaped_code}</code>", code_style)]]
            code_table = Table(code_cell, colWidths=[504])
            code_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(code_table)
            story.append(Spacer(1, 6))

        # University Exam Questions & Solutions Box
        if "exam_qa" in unit and unit["exam_qa"]:
            story.append(Paragraph(f"<b>Frequently Asked University Exam Questions:</b>", h2_style))
            qa_cells = []
            for q_text, a_text in unit["exam_qa"]:
                qa_cells.append([Paragraph(f"• {html.escape(q_text)}", qa_q_style)])
                qa_cells.append([Paragraph(f"&nbsp;&nbsp;<b>Solution:</b> {html.escape(a_text)}", qa_a_style)])
            
            qa_table = Table(qa_cells, colWidths=[504])
            qa_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), c_bg_box),
                ('BOX', (0,0), (-1,-1), 0.5, c_border),
                ('PADDING', (0,0), (-1,-1), 5),
            ]))
            story.append(qa_table)

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceBefore=4, spaceAfter=8))

    # Build Document with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated PDF: {pdf_path}")
    return pdf_path


def main():
    root_out_dir = r"c:\a\DOC-20260822-WA0007\campus_companion\campus_companion_prototyoe (2)\campus_companion_prototyoe\cse_notes_pdf"
    public_out_dir = r"c:\a\DOC-20260822-WA0007\campus_companion\campus_companion_prototyoe (2)\campus_companion_prototyoe\frontend\public\notes"

    for subj in CSE_SUBJECTS_DATA:
        build_subject_pdf(subj, root_out_dir)
        build_subject_pdf(subj, public_out_dir)

    print("All CSE Subject Notes PDFs successfully compiled!")

if __name__ == "__main__":
    main()
