# My Notebook: Personal Knowledge Management & Learning Platform 
## Use Case Diagram

```mermaid
useCaseDiagram
    direction LR

    actor "User" as U
    actor "Google Drive" as G
    actor "AI Service" as AI
    actor "Storage System" as S

    package "My Notebook: Personal Knowledge Management & Learning Platform" {
        usecase "Auth: Login/Signup" as UC1
        usecase "Folder: Manage Hierarchy" as UC2
        usecase "Note: Create/Edit Rich Text" as UC3
        usecase "Note: Draw & Annotate" as UC4
        usecase "Media: Upload/Retrieve (Images/Videos)" as UC5
        usecase "AI: Generate MCQs" as UC6
        usecase "AI: Content Summarization" as UC7
        usecase "Search: Global Text Search" as UC8
        usecase "Social: Secure Note Sharing" as UC9
        usecase "Export: Download as PDF/MD" as UC10
    }

    U --- UC1
    U --- UC2
    U --- UC3
    U --- UC4
    U --- UC5
    U --- UC6
    U --- UC7
    U --- UC8
    U --- UC9
    U --- UC10

    UC5 --- G : Storage Interaction
    UC6 --- AI : MCQ Processing
    UC7 --- AI : Summarization Logic
    UC8 --- S : Indexed Search
```
