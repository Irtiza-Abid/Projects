import java.util.*;

class Passenger {
    int city;
    int ticket;
    Passenger next;

    public Passenger() {
        city = 0;
        ticket = 0;
        next = null;
    }

    public Passenger(int t, int c) {
        city = c;
        ticket = t;
        next = null;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter the number of cases: ");
        int cases = scanner.nextInt();

        for (int i = 0; i < cases; i++) {
            System.out.print("Enter the number of cities: ");
            int cities = scanner.nextInt();
            Graph g = new Graph(cities);

            for (int j = 0; j < cities - 1; j++) {
                g.addEdge(j, j + 1);
            }

            System.out.print("Enter the number of aerial routes: ");
            int aerialRoutes = scanner.nextInt();

            for (int j = 0; j < aerialRoutes; j++) {
                System.out.print("Enter boarding city: ");
                int boardingCity = scanner.nextInt();
                System.out.print("Enter landing city: ");
                int landingCity = scanner.nextInt();
                g.addEdge(boardingCity, landingCity);
            }

            g.printGraph();

            int minDays = g.countDays(0, cities - 1);

            if (minDays != -1) {
                System.out.println("Minimum days required: " + minDays);
            } else {
                System.out.println("Destination is not reachable.");
            }
        }
    }
}

class Queue {
    private Passenger[] elements;
    private int front;
    private int rear;
    private int capacity;

    public Queue(int size) {
        capacity = size;
        elements = new Passenger[size];
        front = -1;
        rear = -1;
    }

    public boolean isEmpty() {
        return front == -1;
    }

    public boolean isFull() {
        return (rear + 1) % capacity == front;
    }

    public void enqueue(Passenger ps) {
        if (isFull()) {
            System.out.println("Queue is full");
            return;
        }
        if (isEmpty()) {
            front = rear = 0;
        } else {
            rear = (rear + 1) % capacity;
        }
        elements[rear] = new Passenger(ps.ticket, ps.city);
    }

    public void dequeue() {
        if (isEmpty()) {
            System.out.println("Queue is empty");
            return;
        }
        elements[front] = null;
        if (front == rear) {
            front = rear = -1;
        } else {
            front = (front + 1) % capacity;
        }
    }

    public Passenger peekFront() {
        if (isEmpty()) {
            System.out.println("Queue is empty");
            return null;
        }
        return elements[front];
    }

    public int size() {
        if (isEmpty()) {
            return 0;
        }
        if (rear >= front) {
            return rear - front + 1;
        } else {
            return capacity - front + rear + 1;
        }
    }
}

class Graph {
    private int[][] adjacencyList;
    private int numVertices;

    public Graph(int numVertices) {
        this.numVertices = numVertices;
        adjacencyList = new int[numVertices][numVertices];
        for (int i = 0; i < numVertices; ++i) {
            for (int j = 0; j < numVertices; ++j) {
                adjacencyList[i][j] = 0;
            }
        }
    }

    public void addEdge(int v, int w) {
        adjacencyList[v][w] = 1;
    }

    public void printGraph() {
        for (int i = 0; i < numVertices; ++i) {
            System.out.print("Vertex " + i + " is connected to: ");
            for (int j = 0; j < numVertices; ++j) {
                if (adjacencyList[i][j] == 1) {
                    System.out.print(j + " ");
                }
            }
            System.out.println();
        }
    }

    public int countDays(int startCity, int destinationCity) {
        Queue q = new Queue(numVertices);
        boolean[] visited = new boolean[numVertices];
        for (int i = 0; i < numVertices; i++) {
            visited[i] = false;
        }
        q.enqueue(new Passenger(0, startCity));
        visited[startCity] = true;
        int days = 0;
        int citiesCovered = 0;
        while (!q.isEmpty()) {
            int citiesInCurrentDay = q.size();
            for (int i = 0; i < citiesInCurrentDay; ++i) {
                int currentCity = q.peekFront().city;
                q.dequeue();
                if (currentCity == destinationCity) {
                    return days - 1;
                }
                for (int j = 0; j < numVertices; ++j) {
                    if (adjacencyList[currentCity][j] == 1 && !visited[j]) {
                        q.enqueue(new Passenger(j, j));
                        visited[j] = true;
                        if (j != currentCity + 1 || citiesCovered == 6) {
                            days++;
                            citiesCovered = 0;
                        } else {
                            citiesCovered++;
                        }
                    }
                }
            }
        }
        return -1;
    }
}
