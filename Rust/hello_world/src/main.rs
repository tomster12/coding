#![allow(dead_code)]
#![allow(unused_variables)]

fn main() {
    // --- List out of range panic ---

    let list: [i32; 5] = [1, 2, 3, 4, 5];

    let mut a: usize = 4;
    a += 1;

    println!("{}", list[a - 1]);
    // println!("{}", list[a]);

    // --- Expression ---

    let y: i32 = {
        let x: i32 = 3;
        x + 1
    };

    println!("The value of y is {}.", y);

    let d: i32 = if true { 5 } else { 6 };

    println!("The value of d is {}.", d);

    // --- Basic functions and loops ---

    println!("10 + 20 = {}.", add(10, 20));

    for i in 0..5 {
        println!("- The value of i is {}.", i);
    }

    // --- Basic ownership ---

    let a: &str = "hello1";
    let a2: &str = a; // Copy

    println!("a: {}", a);
    println!("a2: {}", a2);

    let b: String = String::from("hello2");
    let b2: String = b; // Move

    // println!("b: {}", b);
    println!("b2: {}", b2);

    // --- Ownership movement ---

    let s1: String = String::from("hello");
    let s2: String = in_and_out(s1);

    // println!("s1: {}", s1); // Moved into s2
    println!("s2: {}", s2);

    // --- Reference borrowing ---

    let mut s3: String = String::from("hello");
    // let s4: &String = &s3;
    mutate(&mut s3); // Error with s3 and s4

    println!("s3: {}", s3);
    // println!("s4: {}", s4);

    //  --- Slices ---

    let s: String = String::from("hello world");
    let hello: &str = &s[0..5];
    let world: &str = &s[6..11];
    // s.clear(); // Error with immutable slice references

    println!("hello: {}", hello);
    println!("world: {}", world);

    // --- Structs ---

    let user1: User = User {
        username: String::from("user"),
        email: String::from("someone@example.com"),
        sign_in_count: 1,
        active: true,
    };

    let user2: User = User {
        username: String::from("user2"),
        ..user1
    };

    let black: Color = Color(0, 0, 0);

    // user1.print(); // Moved into user2
    user2.print();
    User::print(&user2);

    println!("black: {} {} {}", black.0, black.1, black.2);

    // let thing: AlwaysEqual = AlwaysEqual;
    // println!("thing: {:?}", thing);

    // --- Enums ---

    let home: IpAddr = IpAddr::V4(String::from("127.0.0.1"));
    let loopback: IpAddr = IpAddr::V6(String::from("::1"));

    // println!("home: {}", home);
    // println!("loopback: {}", loopback);

    // --- Option ---

    let some_number: Option<i32> = Some(5);
    let absent_number: Option<i32> = None;

    // println!("some_number: {}", some_number);
    // println!("absent_number: {}", absent_number);

    // --- Match ---

    let coin: Coin = Coin::Quarter;
    println!("value_in_cents: {}", coin.value_in_cents());

    if let Coin::Quarter = coin {
        println!("coin is a quarter");
    }

    match coin {
        Coin::Quarter => {
            println!("coin is a quarter");
        }
        _ => (),
    }
}

fn add(x: i32, y: i32) -> i32 {
    x + y
}

fn in_and_out(s: String) -> String {
    s // S is moved in and then out
}

fn mutate(s: &mut String) {
    s.push_str(", world");
}

struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}

impl User {
    fn print(self: &Self) {
        println!(
            "user {} {} {} {}",
            self.username, self.email, self.sign_in_count, self.active
        );
    }
}

struct Color(i32, i32, i32);

enum IpAddr {
    V4(String),
    V6(String),
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

impl Coin {
    fn value_in_cents(&self) -> u8 {
        match self {
            Coin::Penny => 1,
            Coin::Nickel => 5,
            Coin::Dime => 10,
            Coin::Quarter => 25,
        }
    }
}
