
#include <iostream>
#include <tuple>

std::tuple<std::string, std::string, int> getVariables0() {
	std::string s0 = "Testing";
	std::string s1 = "Again";
	int i = 3;
	return { s0, s1, i };
}

struct VariableHolder {
	std::string s0;
	std::string s1;
	int i;
};

VariableHolder getVariables1() {
	std::string s0 = "Testing";
	std::string s1 = "Again";
	int i = 3;
	return { s0, s1, i };
}

int main() {
	std::tuple<std::string, std::string, int> output0 = getVariables0(); // Returns a tuple
	std::string s0 = std::get<0>(output0);
	std::string s1 = std::get<1>(output0);
	int i = std::get<2>(output0);

	VariableHolder output1 = getVariables1(); // Returns a VariableHolder object
	std::string s0 = output1.s0;
	std::string s1 = output1.s1;
	int i = output1.i;

	std::cin.get();
}