import os
import html
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.pdfgen import canvas

def generate_subject_textbook(title, code, semester, overview, unit_data_list):
    return {
        "title": title,
        "code": code,
        "semester": semester,
        "filename": f"{title.replace(' ', '_').replace('&', 'and')}_Complete_Notes.pdf",
        "overview": overview,
        "units_topics": unit_data_list
    }

SUBJECTS_CONFIG = [
    {
        "title": "Generative AI and Deep Learning",
        "code": "23CS401",
        "semester": "4-1",
        "overview": "Advanced textbook covering deep neural architectures, backpropagation mathematics, CNN computer vision, sequence modeling with LSTMs, Transformers, Attention mechanisms, and Large Language Models (LLMs).",
        "units_topics": [
            ("Unit 1", "Deep Learning Foundations, Optimization & Regularization", [
                ("1.1 Artificial Neurons, Perceptrons & Multi-Layer Networks", "Neural networks model non-linear mappings. An artificial neuron computes activation a = sigma(W^T x + b). Multi-Layer Perceptrons (MLPs) overcome the XOR linear separability limitation by stacking hidden layers. Universal Approximation Theorem proves that a single hidden layer feed-forward network with non-linear activation functions can approximate any continuous function on compact subsets of R^n."),
                ("1.2 Non-Linear Activation Functions & Vanishing Gradients", "Activation functions introduce non-linearity. Sigmoid sigma(z) = 1 / (1 + e^-z) and Tanh compress inputs into (0,1) and (-1,1) but suffer from Vanishing Gradients when |z| is large because their derivatives approach zero. Rectified Linear Unit (ReLU) f(z) = max(0, z) maintains constant gradient 1 for positive inputs, accelerating convergence. Leaky ReLU and GeLU (Gaussian Error Linear Unit) prevent dying neuron states."),
                ("1.3 Backpropagation Mathematics & Chain Rule Derivations", "Backpropagation computes partial derivatives of the loss function L with respect to all network weights W using the multivariate chain rule. For layer l: delta^l = (W^{l+1 T} delta^{l+1}) odot sigma'(z^l), yielding weight gradients dL/dW^l = delta^l (a^{l-1})^T. Parameter updates proceed via gradient descent."),
                ("1.4 Optimization Algorithms & Regularization Techniques", "Gradient descent variants: 1. Stochastic Gradient Descent (SGD with Momentum beta), 2. RMSprop (scales updates by moving average of squared gradients), 3. Adam (combines momentum and adaptive learning rates). Regularization mitigates overfitting: L2 Weight Decay (penalizes large weights), Dropout (randomly deactivates neuron subsets during training with probability p), and Batch Normalization (normalizes layer inputs to zero mean and unit variance).")
            ]),
            ("Unit 2", "Convolutional Neural Networks (CNNs) & Computer Vision", [
                ("2.1 Convolution Operations, Strides & Receptive Fields", "CNNs process grid-structured spatial data (images). The discrete 2D convolution operation slides a learnable kernel filter K across input feature map I: S(i, j) = sum_m sum_n I(i+m, j+n) K(m, n). Padding (Valid vs Same) controls output spatial dimensions; Strides dictate kernel step sizes. The Effective Receptive Field expands with deeper convolutional stacking."),
                ("2.2 Pooling Layers & Feature Map Hierarchies", "Pooling operations (Max Pooling, Average Pooling) downsample spatial feature maps, introducing translational invariance and reducing computational parameter count while preserving dominant activations."),
                ("2.3 Landmark CNN Architectures (AlexNet, VGG, ResNet)", "1. AlexNet (2012; popularized deep CNNs, ReLU, Dropout, GPU training), 2. VGG-16 (demonstrated that homogeneous stacks of small 3x3 convolution filters outperform large 7x7 filters), 3. ResNet (Residual Networks; introduced Skip Connections / Identity Mappings F(x) + x, enabling stable gradient flow in networks with 152+ layers)."),
                ("2.4 Advanced Vision Tasks (Object Detection & Face Biometrics)", "Object detection integrates classification and spatial localization (YOLO single-stage regression vs Faster R-CNN two-stage region proposals). Face recognition systems (FaceNet, ArcFace) map facial images into compact 128-dimensional or 512-dimensional Euclidean embedding spaces where Euclidean distance correlates directly with facial identity similarity.")
            ]),
            ("Unit 3", "Sequential Models, Recurrent Networks & Gated Units", [
                ("3.1 Sequence Modeling & Recurrent Neural Networks (RNN)", "Sequential data (text, time series) violates i.i.d. assumptions. Standard RNNs maintain a recurring hidden state: h_t = tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h). When backpropagating through time (BPTT), repeated matrix multiplications cause gradients to either explode (countered by Gradient Clipping) or vanish exponentially over long sequences."),
                ("3.2 Long Short-Term Memory (LSTM) Architecture", "LSTMs resolve vanishing gradients via a dedicated Cell State C_t regulated by 3 multiplicative gates: 1. Forget Gate f_t = sigma(W_f [h_{t-1}, x_t] + b_f), 2. Input Gate i_t = sigma(W_i [h_{t-1}, x_t] + b_i) and Candidate State tilde{C}_t = tanh(W_c [h_{t-1}, x_t] + b_c), 3. Output Gate o_t = sigma(W_o [h_{t-1}, x_t] + b_o). Cell state updates linearly: C_t = f_t odot C_{t-1} + i_t odot tilde{C}_t."),
                ("3.3 Gated Recurrent Units (GRU) & Bidirectional RNNs", "GRUs simplify LSTM architecture by merging cell and hidden states into a single state vector using Reset and Update gates. Bidirectional RNNs process sequences in forward and reverse directions concurrently, capturing future and past context."),
                ("3.4 Sequence-to-Sequence (Seq2Seq) & Attention Foundations", "Seq2Seq models map variable-length input sequences to variable-length outputs using Encoder-Decoder frameworks. Bottlenecking long inputs into a single fixed-size context vector degrades translation performance; Bahdanau Additive Attention resolves this by allowing decoders to dynamically attend to weighted combinations of all encoder hidden states.")
            ]),
            ("Unit 4", "The Transformer Architecture & Self-Attention Mechanisms", [
                ("4.1 Scaled Dot-Product Attention & Mathematical Formulations", "Transformers ('Attention Is All You Need', 2017) eliminate recurrence entirely. Scaled Dot-Product Attention maps Query Q, Key K, and Value V matrices: Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. Scaling by sqrt(d_k) prevents large dot products from pushing softmax into vanishing gradient regimes."),
                ("4.2 Multi-Head Attention & Subspace Representation", "Multi-Head Attention projects Q, K, V into h distinct parameter subspaces: MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W^O where head_i = Attention(Q W_i^Q, K W_i^K, V W_i^V). This enables the network to simultaneously attend to information from different representation subspaces at different token positions."),
                ("4.3 Positional Encodings & Layer Normalization", "Because self-attention is permutation-equivariant and contains no innate sequential ordering, sinusoidal Positional Encodings PE(pos, 2i) = sin(pos / 10000^{2i/d}) or learnable position embeddings are added to token input vectors. Pre-Layer Normalization and residual connections stabilize deep transformer convergence."),
                ("4.4 Transformer Families: BERT, GPT & Vision Transformers", "1. BERT (Bidirectional Encoder Representations from Transformers; uses Masked Language Modeling for contextual representations), 2. GPT (Generative Pre-trained Transformer; uses Autoregressive causal masked decoder stacks for next-token text generation), 3. Vision Transformers (ViT; partitions images into 16x16 flattened patches treated as tokens).")
            ]),
            ("Unit 5", "Generative Models, Large Language Models & Modern GenAI", [
                ("5.1 Variational Autoencoders (VAEs) & Latent Spaces", "VAEs model continuous data distributions by encoding inputs into mean mu and variance sigma^2 latent vectors. The Reparameterization Trick z = mu + sigma odot epsilon (where epsilon ~ N(0, I)) allows gradients to backpropagate through stochastic sampling nodes. Loss combines Reconstruction Loss and KL-Divergence regularization."),
                ("5.2 Generative Adversarial Networks (GANs) & Diffusion Models", "GANs formulate a minimax game between a Generator G (creating synthetic data from noise) and a Discriminator D (classifying real vs fake). Denoising Diffusion Probabilistic Models (DDPM / Stable Diffusion) generate high-fidelity media by iteratively reversing a Markovian forward noise corruption process."),
                ("5.3 Large Language Model (LLM) Pretraining & RLHF Alignment", "LLMs are pretrained on trillions of internet tokens via self-supervised next-token prediction. Instruction fine-tuning and Reinforcement Learning from Human Feedback (RLHF / Direct Preference Optimization DPO) align raw base models to follow human instructions safely and helpfully."),
                ("5.4 Parameter-Efficient Fine-Tuning (PEFT/LoRA) & RAG Systems", "Low-Rank Adaptation (LoRA) freezes pretrained model weights W_0 and injects rank decomposition matrices Delta W = B A (where r << d), reducing trainable parameters by 99% with zero added inference latency. Retrieval-Augmented Generation (RAG) integrates vector databases (Pinecone, ChromaDB) with dense embeddings, retrieving top-k relevant knowledge chunks at runtime to eliminate LLM hallucinations.")
            ])
        ]
    },
    {
        "title": "Cryptography and Network Security",
        "code": "23CS402",
        "semester": "4-1",
        "overview": "Exhaustive textbook on modern cryptographic primitives, symmetric and asymmetric ciphers, number theory proofs, digital signatures, hash functions, and network security protocols.",
        "units_topics": [
            ("Unit 1", "Security Goals, Threat Models & Classical Encryption", [
                ("1.1 CIA Security Triad, Attacks & Security Architecture", "Computer security ensures Confidentiality (preventing unauthorized disclosure), Integrity (preventing unauthorized modification), and Availability (ensuring timely authorized access). Threats are categorized into Passive Attacks (eavesdropping, traffic analysis) and Active Attacks (masquerade, replay, message tampering, denial of service)."),
                ("1.2 Classical Substitution & Transposition Ciphers", "Monoalphabetic ciphers (Caesar, Playfair) substitute characters but are vulnerable to frequency analysis. Polyalphabetic ciphers (Vigenere, Hill Cipher) use modular matrix transformations C = K P mod 26. Transposition ciphers (Rail Fence, Columnar Transposition) rearrange character positions to maximize diffusion."),
                ("1.3 Modular Arithmetic & Euclidean Algorithms", "Modular arithmetic forms the algebraic basis of modern cryptography over Galois Fields. The Euclidean Algorithm computes gcd(a, b). The Extended Euclidean Algorithm calculates the modular multiplicative inverse a^-1 mod m such that (a * a^-1) = 1 mod m, existing iff gcd(a, m) = 1."),
                ("1.4 Number Theory Principles & Euler's Totient Function", "Fermat's Little Theorem states a^{p-1} = 1 mod p for prime p and gcd(a, p) = 1. Euler's Totient Function phi(n) counts integers k < n coprime to n; for semiprime n = p * q, phi(n) = (p - 1)(q - 1). Euler's Theorem generalizes: a^{phi(n)} = 1 mod n.")
            ]),
            ("Unit 2", "Symmetric Block Ciphers: DES & AES Standards", [
                ("2.1 Feistel Cipher Network & DES Architecture", "Data Encryption Standard (DES) executes 16 Feistel rounds over 64-bit plaintext blocks using 56-bit keys. Feistel networks provide reversible decryption using the identical round function by reversing key schedules. Triple DES (3DES) achieves 112/168-bit security via EDE (Encrypt-Decrypt-Encrypt) chaining."),
                ("2.2 Advanced Encryption Standard (AES) Mathematical Operations", "AES is an iterated Substitution-Permutation Network operating on a 4x4 state matrix of bytes over finite field GF(2^8). AES-128 (10 rounds), AES-192 (12 rounds), and AES-256 (14 rounds) execute 4 distinct transformations: SubBytes (non-linear S-Box), ShiftRows (cyclical byte shifting), MixColumns (matrix polynomial multiplication), and AddRoundKey (XOR with round subkeys)."),
                ("2.3 Block Cipher Modes of Operation", "1. Electronic Codebook (ECB; deterministic, leaks patterns), 2. Cipher Block Chaining (CBC; XORs plaintext with previous ciphertext block using an IV), 3. Cipher Feedback (CFB) & Output Feedback (OFB), 4. Counter Mode (CTR; transforms block cipher into stream cipher, enabling parallel high-speed hardware encryption)."),
                ("2.4 Differential & Linear Cryptanalysis Resistance", "AES S-Boxes are mathematically constructed using multiplicative inverses in GF(2^8) combined with affine transformations, provably maximizing non-linearity and immunity against linear and differential cryptanalysis attacks.")
            ]),
            ("Unit 3", "Asymmetric Public-Key Cryptography & Key Distribution", [
                ("3.1 Public-Key Principles & Trapdoor One-Way Functions", "Asymmetric cryptography utilizes key pairs: a Public Key for encryption/verification and a Private Key for decryption/signing, resolving symmetric key distribution bottlenecks via trapdoor one-way mathematical functions."),
                ("3.2 RSA Cryptosystem Algorithm & Security Proof", "RSA key generation: Select large primes p and q, compute modulus n = p * q and phi(n) = (p-1)(q-1). Choose public exponent e coprime to phi(n). Compute private key d = e^-1 mod phi(n). Encryption: C = M^e mod n. Decryption: M = C^d mod n. Security relies on the computational intractability of integer factorization."),
                ("3.3 Diffie-Hellman Key Exchange & MITM Attack Mitigation", "Diffie-Hellman enables two parties to establish a shared secret over an insecure channel via modular exponentiation: K = (g^a mod p)^b mod p = g^{ab} mod p. Unauthenticated Diffie-Hellman is vulnerable to Man-In-The-Middle (MITM) attacks, resolved by signing exchanges with digital certificates."),
                ("3.4 Elliptic Curve Cryptography (ECC)", "ECC defines algebraic groups over points (x, y) on Weierstrass cubic curves y^2 = x^3 + a x + b mod p. ECC delivers equivalent RSA-2048 security with compact 256-bit keys, drastically cutting compute cycles and bandwidth for mobile and IoT devices.")
            ]),
            ("Unit 4", "Cryptographic Hash Functions & Digital Signatures", [
                ("4.1 Hash Properties (Collision Resistance & Avalanche Effect)", "Cryptographic hash functions H(M) produce fixed-size digests satisfying: 1. Pre-image Resistance (one-way), 2. Second Pre-image Resistance (weak collision resistance), 3. Collision Resistance (hard to find any M1 != M2 with H(M1) = H(M2)). Small input bit changes trigger widespread output divergence (Avalanche Effect)."),
                ("4.2 SHA-256 / SHA-512 Architecture & HMAC", "Secure Hash Algorithm 2 (SHA-256) processes 512-bit message blocks through 64 compression rounds using bitwise logical functions (Ch, Maj, Sigma). Hash-based Message Authentication Codes (HMAC) combine cryptographic hashes with secret shared keys for API packet authentication."),
                ("4.3 Digital Signatures & Non-Repudiation", "A digital signature is generated by encrypting a message hash with the sender's private key: S = Sign_{K_priv}(H(M)). The recipient verifies using the sender's public key: Verify_{K_pub}(S) == H(M), guaranteeing Authenticity, Integrity, and Non-Repudiation."),
                ("4.4 Public Key Infrastructure (PKI) & X.509 Certificates", "PKI binds public keys to verified identities through trusted Certificate Authorities (CAs). X.509 certificates contain Subject Info, Public Key, Issuer Signature, Validity Period, and Key Usage constraints, authenticated via Certificate Revocation Lists (CRL) and OCSP stapling.")
            ]),
            ("Unit 5", "Network Security Protocols, Firewalls & System Defenses", [
                ("5.1 IPsec Protocol Architecture (AH, ESP & IKE)", "IP Security (IPsec) operates at the Network Layer. Authentication Header (AH) guarantees packet integrity; Encapsulating Security Payload (ESP) provides both confidentiality and authentication. Modes include Transport Mode (encrypts payload only) and Tunnel Mode (encapsulates entire IP packet inside VPN tunnels)."),
                ("5.2 Transport Layer Security (TLS 1.3 Handshake)", "TLS secures application protocols (HTTPS, SSH). TLS 1.3 achieves single-round-trip (1-RTT) or zero-round-trip (0-RTT) handshakes using ephemeral Diffie-Hellman key exchange (ECDHE) for Perfect Forward Secrecy (PFS), encrypting all traffic after the Initial Client Hello."),
                ("5.3 Firewalls, Stateful Inspection & Web Application Firewalls (WAF)", "Firewalls filter network traffic: 1. Packet Filtering (inspects IP headers and ports), 2. Stateful Inspection (tracks TCP 3-way handshake and connection states), 3. Application Layer Gateways / WAF (inspects HTTP payloads to block SQL Injection, XSS, and CSRF attacks)."),
                ("5.4 Intrusion Detection (IDS/IPS) & DDoS Mitigation", "Intrusion Detection Systems utilize Signature-Based Detection (known vulnerability patterns) and Anomaly-Based Detection (statistical ML deviations). Distributed Denial of Service (DDoS) mitigation leverages Anycast routing, Rate Limiting, SYN Cookies, and Cloud Scrubbing centers.")
            ])
        ]
    },
    {
        "title": "Big Data Analytics",
        "code": "23CS403",
        "semester": "4-1",
        "overview": "Comprehensive textbook covering Hadoop distributed architecture, HDFS storage, MapReduce computing, Apache Spark in-memory processing, NoSQL databases, and streaming analytics.",
        "units_topics": [
            ("Unit 1", "Big Data Landscape & Hadoop Distributed File System (HDFS)", [
                ("1.1 The 5 V's of Big Data & Distributed Paradigms", "Big Data is characterized by Volume (petabyte scale), Velocity (real-time stream rates), Variety (structured, semi-structured, unstructured data), Veracity (data quality and trust), and Value (actionable business insights). Traditional RDBMS architectures bottleneck under horizontal scaling; distributed shared-nothing architectures resolve this by partitioning data across commodity clusters."),
                ("1.2 Hadoop Ecosystem Architecture & Components", "Apache Hadoop provides open-source distributed storage and processing. Core ecosystem components include HDFS (storage layer), YARN (resource negotiator), MapReduce (batch processing engine), Hive (SQL data warehousing), Pig (data flow scripting), Sqoop (RDBMS data ingestion), and Flume (log collection)."),
                ("1.3 HDFS Architecture, NameNode & DataNodes", "HDFS employs a Master/Worker model. The NameNode (Master) manages the file system namespace, metadata, directory trees, and block mappings in memory (persisted via FsImage and EditLogs). DataNodes (Workers) store raw data blocks (default 128MB) on local disks, serving read/write requests and sending periodic Heartbeats and Block Reports to the NameNode."),
                ("1.4 HDFS Fault Tolerance, Replication & High Availability", "HDFS guarantees resilience via Block Replication (default factor 3: primary node, secondary node on same rack, tertiary node on a remote rack for rack awareness). NameNode High Availability (HA) utilizes active/standby pairs synchronized via Quorum Journal Manager (QJM) and ZooKeeper to eliminate single points of failure.")
            ]),
            ("Unit 2", "Distributed Computing with MapReduce & YARN", [
                ("2.1 MapReduce Programming Paradigm & Workflow", "MapReduce processes massive datasets in parallel across two phases: 1. Map Phase (reads input splits, executes map(k1, v1) -> list(k2, v2)), 2. Shuffle & Sort Phase (groups and sorts intermediate key-value pairs across the network), 3. Reduce Phase (executes reduce(k2, list(v2)) -> list(k3, v3))."),
                ("2.2 Combiners, Partitioners & Custom Data Types", "Combiners act as mini-reducers running locally on mapper nodes to aggregate data before network transfer, slashing network I/O. Partitioners (e.g. HashPartitioner) route intermediate keys to specific reducer tasks. Custom types implement Writable and WritableComparable interfaces for serialization."),
                ("2.3 YARN (Yet Another Resource Negotiator) Architecture", "YARN decouples resource management from processing. The ResourceManager (global scheduler) allocates cluster resources (Containers) across nodes. The NodeManager monitors CPU/memory on individual nodes. The ApplicationMaster negotiates containers per job and tracks execution lifecycle."),
                ("2.4 MapReduce Optimization & Speculative Execution", "Straggler tasks on degraded nodes delay overall job completion; YARN initiates Speculative Execution by launching redundant duplicate task attempts on alternate nodes and committing whichever finishes first.")
            ]),
            ("Unit 3", "In-Memory Analytics with Apache Spark", [
                ("3.1 Apache Spark Architecture & Resilient Distributed Datasets (RDD)", "Apache Spark achieves up to 100x faster execution than MapReduce by caching data in memory. RDDs are immutable, lazily-evaluated distributed collections partitioned across cluster worker nodes with lineage graphs for automatic fault recovery without disk replication."),
                ("3.2 RDD Operations: Transformations vs Actions", "Transformations (map, filter, flatMap, groupByKey, reduceByKey) create new RDDs lazily. Actions (count, collect, reduce, saveAsTextFile) trigger execution pipelines by compiling lineage graphs into Directed Acyclic Graphs (DAGs) divided into execution Stages."),
                ("3.3 Spark SQL, DataFrames & Catalyst Optimizer", "DataFrames provide structured schema abstractions over RDDs. The Catalyst Optimizer analyzes abstract syntax trees, applying rule-based and cost-based optimizations (predicate pushdown, column pruning, broadcast hash joins) to generate optimized Java bytecode via Tungsten execution."),
                ("3.4 Spark MLlib & Distributed Machine Learning", "Spark MLlib implements scalable machine learning pipelines (Feature Transformers, VectorAssembler, LogisticRegression, RandomForest, KMeans) executing distributed gradient updates across in-memory partitions.")
            ]),
            ("Unit 4", "NoSQL Data Stores & Distributed Database Architectures", [
                ("4.1 CAP Theorem & BASE Consistency Properties", "Brewer's CAP Theorem dictates that a distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance. NoSQL databases prioritize AP or CP, adopting BASE semantics (Basically Available, Soft-state, Eventual consistency) over rigid ACID constraints."),
                ("4.2 NoSQL Database Categories & Data Models", "1. Key-Value Stores (Redis, DynamoDB; O(1) hash lookups), 2. Column-Family Stores (Apache Cassandra, HBase; sparse multi-dimensional maps indexed by row key, column family, and timestamp), 3. Document Stores (MongoDB, CouchDB; hierarchical JSON/BSON documents), 4. Graph Databases (Neo4j; property graphs with nodes and edges)."),
                ("4.3 Apache HBase Architecture & HFiles", "HBase provides real-time random read/write access on top of HDFS. The HMaster coordinates DDL operations. RegionServers host table Regions consisting of MemStore (in-memory write buffer), Write-Ahead Logs (WAL), and persistent HFiles (LSM Trees) on HDFS."),
                ("4.4 Apache Cassandra & Consistent Hashing Ring", "Cassandra uses a peer-to-peer decentralized architecture with no master node. Partition keys hash onto a Consistent Hashing Ring using Murmur3. Read and write operations configure tunable Consistency Levels (ONE, QUORUM, ALL) via Gossip protocols.")
            ]),
            ("Unit 5", "Real-Time Streaming Analytics & Big Data Pipelines", [
                ("5.1 Stream Processing Concepts: Batch vs Real-Time", "Batch processing operates on static bounded data with high latency; Stream processing ingests continuous unbounded event streams with sub-second latency. Windowing semantics include Tumbling Windows (fixed, non-overlapping), Sliding Windows (fixed, overlapping), and Session Windows (gap-based)."),
                ("5.2 Apache Kafka Distributed Event Streaming", "Apache Kafka functions as a high-throughput, fault-tolerant publish-subscribe event log. Topics are partitioned and replicated across Broker nodes. Producers publish events; Consumers read from Consumer Groups tracking offset positions with zero-copy network transfer."),
                ("5.3 Spark Streaming & Structured Streaming", "Spark Structured Streaming treats real-time data as an continuously appending unbounded table, supporting event-time processing, watermarking (handling late data arrivals), and end-to-end exactly-once fault-tolerance guarantees."),
                ("5.4 Enterprise Big Data Pipelines & Data Lake Architecture", "Modern enterprise data lakes (Delta Lake, Apache Iceberg) combine bronze (raw ingestion), silver (cleaned/enriched), and gold (business aggregated) layers with ACID transaction support on top of object storage (AWS S3, Azure Data Lake).")
            ])
        ]
    },
    {
        "title": "MLOps and Model Deployment",
        "code": "23CS404",
        "semester": "4-1",
        "overview": "Comprehensive textbook covering the machine learning lifecycle, experiment tracking, automated CI/CD pipelines for ML, containerization, model serving, and production monitoring.",
        "units_topics": [
            ("Unit 1", "Introduction to MLOps & The Machine Learning Lifecycle", [
                ("1.1 Evolution from DevOps to MLOps", "MLOps (Machine Learning Operations) extends DevOps principles to machine learning systems, bridging the gap between data science experimentation and scalable production deployment. Unlike traditional software, ML systems manage code, data, and models simultaneously, contending with Technical Debt in Machine Learning (hidden feedback loops, pipeline jungles, data dependencies)."),
                ("1.2 The End-to-End ML Lifecycle", "1. Problem Formulation & Data Ingestion, 2. Exploratory Data Analysis (EDA) & Feature Engineering, 3. Model Training & Hyperparameter Tuning, 4. Model Validation & Fairness Testing, 5. Containerized Deployment & Serving, 6. Continuous Production Monitoring & Retraining."),
                ("1.3 MLOps Maturity Levels (Google Framework)", "Level 0: Manual Process (script-driven, manual model handoff, no tracking). Level 1: ML Pipeline Automation (automated training pipelines, feature stores, metadata management). Level 2: CI/CD Pipeline Automation (automated testing, building, and zero-downtime deployment of training pipelines)."),
                ("1.4 Data Version Control (DVC) & Reproducibility", "Git cannot efficiently version multi-gigabyte training datasets. Data Version Control (DVC) tracks dataset and model hashes in Git while storing large binary files in remote storage (S3, GCS), guaranteeing 100% reproducible experiments across pipeline runs.")
            ]),
            ("Unit 2", "Experiment Tracking, Feature Stores & Model Registries", [
                ("2.1 Experiment Tracking with MLflow & Weights & Biases", "During experimentation, tracking systems log parameters (learning rate, batch size), metrics (F1-score, loss curves), code commit SHAs, and model artifacts. MLflow Tracking stores runs in centralized backends for comparison and visualization."),
                ("2.2 Feature Store Architecture (Feast / Hopsworks)", "Feature stores provide a single source of truth for features across training and inference. Offline Feature Stores (batch storage via BigQuery, Snowflake) serve historical features for training. Online Feature Stores (low-latency key-value databases like Redis) serve real-time feature vectors at inference time, eliminating Training-Serving Skew."),
                ("2.3 Model Registry & Lifecycle Management", "Model Registries (MLflow Model Registry) act as governed repositories tracking model versions, metadata, schema signatures, and stage transitions (Draft -> Staging -> Production -> Archived) with RBAC approval gates."),
                ("2.4 Hyperparameter Optimization (Optuna / Ray Tune)", "Automated Hyperparameter Optimization utilizes Bayesian Optimization (Tree-structured Parzen Estimators TPE) and early stopping algorithms (Hyperband, ASHA) to explore high-dimensional parameter spaces efficiently.")
            ]),
            ("Unit 3", "Continuous Integration & Automated Pipelines (CI/CD/CT)", [
                ("3.1 CI/CD for Machine Learning Systems", "Continuous Integration (CI) in MLOps tests code (unit tests, linting), validates data schemas (Great Expectations), and tests model quality against baseline benchmarks. Continuous Delivery (CD) automatically packages validated models into production Docker containers."),
                ("3.2 Continuous Training (CT) Triggers", "Continuous Training automatically retrains models in production when: 1. Scheduled intervals trigger, 2. Data drift or model degradation thresholds are breached, 3. New labeled data arrives, 4. Business logic or feature engineering code is updated."),
                ("3.3 Orchestration Frameworks: Kubeflow Pipelines & Airflow", "Apache Airflow coordinates complex directed acyclic graphs (DAGs) of tasks with scheduled execution. Kubeflow Pipelines builds scalable containerized ML workflows natively on Kubernetes, where each pipeline step executes as an isolated pod with typed artifact passing."),
                ("3.4 Automated Testing: Data Validation & Model Quality Gates", "Data validation frameworks (Great Expectations, Pandera) assert column distributions, null ratios, and data types before training. Model quality gates verify precision/recall improvements and fairness checks before authorizing production registry promotion.")
            ]),
            ("Unit 4", "Model Packaging, Containerization & Serving Architectures", [
                ("4.1 Docker Containerization for ML Artifacts", "Docker packages the model weights, inference runtime (Python, CUDA), and dependencies into portable, immutable container images. Multi-stage Docker builds minimize final image sizes for faster deployment cycles."),
                ("4.2 Model Serving Paradigms: Real-Time vs Batch vs Embedded", "1. Real-Time REST/gRPC Serving (sub-100ms synchronous API inference), 2. Batch Serving (asynchronous high-throughput offline scoring), 3. Streaming Inference (processing Kafka event topics in real-time), 4. Edge / Embedded Serving (ONNX Runtime, TensorRT, CoreML on mobile/IoT)."),
                ("4.3 High-Performance Inference Servers (Triton / TorchServe / FastAPI)", "FastAPI provides lightweight asynchronous REST endpoints. NVIDIA Triton Inference Server manages dynamic batching, multi-model concurrent execution, and hardware acceleration across CPUs and GPUs."),
                ("4.4 Deployment Strategies: Canary, Blue-Green & Shadow Deployments", "1. Blue-Green Deployment (switches 100% traffic between identical green and blue environments instantly), 2. Canary Deployment (routes 5-10% traffic to the new model, expanding gradually if metrics stay healthy), 3. Shadow Deployment (mirrors production traffic to the new model without returning its predictions to users).")
            ]),
            ("Unit 5", "Production Monitoring, Drift Detection & Governance", [
                ("5.1 Model Degradation & Types of Drift", "1. Data Drift / Covariate Shift (distribution of input features P(X) changes over time), 2. Concept Drift (relationship between inputs and targets P(Y|X) changes, e.g. consumer fraud patterns during holidays), 3. Prior Probability Shift P(Y)."),
                ("5.2 Statistical Drift Detection Methods", "Drift detection algorithms compare baseline reference distributions against sliding inference windows: Kolmogorov-Smirnov (KS) Test for continuous features, Population Stability Index (PSI), Wasserstein Distance, and Kullback-Leibler (KL) Divergence."),
                ("5.3 Observability Frameworks: Prometheus, Grafana & Evidently AI", "Prometheus scrapes operational metrics (CPU/memory usage, latency percentiles p95/p99, error rates). Evidently AI generates automated statistical reports on data drift, target drift, and model performance decay."),
                ("5.4 Model Governance, Explainability (SHAP/LIME) & Responsible AI", "Model governance enforces compliance, audit trails, and security. SHAP (Shapley Additive exPlanations based on cooperative game theory) and LIME provide local and global feature attribution to interpret model predictions for stakeholders.")
            ])
        ]
    }
]

class ComprehensiveNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(ComprehensiveNumberedCanvas, self).__init__(*args, **kwargs)
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
        
        # Header (On page 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, "PBR VITS • Department of Computer Science & Engineering • Official Course Notes")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer (On all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "PBR Visvodaya Institute of Technology & Science, Kavali (Autonomous)")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_long_textbook_pdf(subject_info, output_dir):
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
    
    c_primary = colors.HexColor("#1E3A8A")
    c_secondary = colors.HexColor("#0284C7")
    c_dark = colors.HexColor("#0F172A")
    c_muted = colors.HexColor("#475569")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_primary,
        alignment=1,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=c_muted,
        alignment=1,
        spaceAfter=15
    )

    unit_title_style = ParagraphStyle(
        'UnitTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=c_primary,
        spaceBefore=16,
        spaceAfter=10
    )

    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_secondary,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=c_dark,
        spaceAfter=8
    )

    qa_q_style = ParagraphStyle(
        'QAQuestion',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#991B1B")
    )

    qa_a_style = ParagraphStyle(
        'QAAnswer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=c_dark,
        spaceAfter=6
    )

    story = []

    story.append(Paragraph("PBR VISVODAYA INSTITUTE OF TECHNOLOGY & SCIENCE", ParagraphStyle('Inst', fontName='Helvetica-Bold', fontSize=10, textColor=c_secondary, alignment=1, spaceAfter=4)))
    story.append(Paragraph(f"{subject_info['title'].upper()}", title_style))
    story.append(Paragraph(f"Course Code: <b>{subject_info['code']}</b> • Semester: <b>{subject_info['semester']}</b> • Comprehensive 5-Unit Academic Compendium", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=c_primary, spaceBefore=2, spaceAfter=12))

    ov_table = Table([[Paragraph(f"<b>Course Objective & Overview:</b> {html.escape(subject_info['overview'])}", body_style)]], colWidths=[504])
    ov_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BBF7D0")),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(ov_table)
    story.append(Spacer(1, 15))

    for unit_tuple in subject_info["units_topics"]:
        unit_num, unit_name, sections = unit_tuple
        story.append(PageBreak())
        story.append(Paragraph(f"{html.escape(unit_num)}: {html.escape(unit_name)}", unit_title_style))
        story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=4, spaceAfter=12))

        for sec_title, sec_text in sections:
            story.append(Paragraph(html.escape(sec_title), h2_style))
            story.append(Paragraph(html.escape(sec_text), body_style))
            story.append(Spacer(1, 8))

        story.append(Spacer(1, 8))
        story.append(Paragraph(f"University Examination Review Questions — {html.escape(unit_num)}", h2_style))

        exam_data = [
            (f"Q1. Explain the fundamental theoretical and practical significance of {unit_name}.",
             f"Solution: {unit_name} provides the structural foundation required for engineering implementation. It decomposes complex computational tasks into rigorous mathematical models and modular subsystems, guaranteeing deterministic performance and predictable resource utilization."),
            (f"Q2. What are the key architectural constraints and design tradeoffs associated with {unit_name}?",
             "Solution: Primary tradeoffs include time complexity vs space complexity, throughput vs latency, and hardware abstraction vs direct memory manipulation. Proper selection depends on specific latency budgets and deployment environments."),
            (f"Q3. Derive or explain the step-by-step mathematical/algorithmic procedure for core operations in {unit_name}.",
             "Solution: 1. Input state initialization and boundary parameter validation. 2. Iterative or recursive state transitions preserving invariant constraints. 3. Convergence termination check. 4. Output verification and error propagation handling."),
            (f"Q4. Compare alternative methodologies and explain when each approach is preferred.",
             "Solution: Deterministic approaches guarantee bounded worst-case bounds; heuristic/probabilistic methods provide near-optimal results for NP-hard domains in linear or sub-quadratic time."),
            (f"Q5. Analyze the worst-case, best-case, and average-case performance bounds.",
             "Solution: Standard operations exhibit O(1) or O(log N) optimal lookup, O(N log N) divide-and-conquer processing, and O(N^2) unmitigated worst-case bounds under adversarial inputs."),
            (f"Q6. Discuss memory management, cache locality, and runtime optimization strategies.",
             "Solution: Spatial locality maximizes CPU L1/L2 cache hit ratios through contiguous memory layout; temporal locality reuses recently referenced data structures before eviction."),
            (f"Q7. Describe error detection, exception handling, and fault tolerance mechanisms.",
             "Solution: Robust implementations employ defensive bounds checking, transactional rollback semantics, write-ahead logging, and grace degradation paths."),
            (f"Q8. How does modern industry software integrate these concepts at enterprise scale?",
             "Solution: Scaled deployments utilize multi-threaded asynchronous workers, microservice partitioning, distributed consensus protocols, and hardware vectorization (SIMD / GPU acceleration)."),
            (f"Q9. What are common implementation pitfalls and how are they mitigated?",
             "Solution: Common pitfalls include off-by-one boundary errors, unhandled null references, race conditions, memory leaks, and premature optimization without profiling."),
            (f"Q10. Summarize the key formulas, theorems, and critical revision points for {unit_num}.",
             "Solution: Master the fundamental governing equations, invariant properties, state machine transitions, and asymptotic space/time complexity bounds documented in this chapter.")
        ]

        qa_table_rows = []
        for q, a in exam_data:
            qa_table_rows.append([Paragraph(html.escape(q), qa_q_style)])
            qa_table_rows.append([Paragraph(html.escape(a), qa_a_style)])

        qa_table = Table(qa_table_rows, colWidths=[504])
        qa_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(qa_table)

    doc.build(story, canvasmaker=ComprehensiveNumberedCanvas)
    print(f"Successfully compiled deep textbook PDF: {pdf_path}")
    return pdf_path


def main():
    root_out_dir = r"c:\a\DOC-20260822-WA0007\campus_companion\campus_companion_prototyoe (2)\campus_companion_prototyoe\cse_notes_pdf"
    public_out_dir = r"c:\a\DOC-20260822-WA0007\campus_companion\campus_companion_prototyoe (2)\campus_companion_prototyoe\frontend\public\notes"

    for config in SUBJECTS_CONFIG:
        subj_obj = generate_subject_textbook(
            title=config["title"],
            code=config["code"],
            semester=config["semester"],
            overview=config["overview"],
            unit_data_list=config["units_topics"]
        )
        build_long_textbook_pdf(subj_obj, root_out_dir)
        build_long_textbook_pdf(subj_obj, public_out_dir)

    print("All deep textbook-grade subject notes PDFs successfully compiled!")

if __name__ == "__main__":
    main()
