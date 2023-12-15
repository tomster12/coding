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

    // --- Borrowing ---

    let s1: String = String::from("hello");
    let s2: String = in_and_out(s1);
    // println!("s1: {}", s1);
    println!("s2: {}", s2);

    // --- Mutable borrowing ---

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
