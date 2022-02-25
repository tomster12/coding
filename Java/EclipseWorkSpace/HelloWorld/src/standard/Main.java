package standard;

public class Main {

	public static void main(String[] args) {
		Greetings gr = new Greetings("Hello World");
		gr.output();

		String[] elements = {
				"no",
				"noAgain",
				"finalNo"
		};

		for (String str : elements) {
			System.out.println(str);
		}

		int nums[] = new int[5];
		System.out.println(nums.length);
		System.out.println(nums[0]);
	}
}
