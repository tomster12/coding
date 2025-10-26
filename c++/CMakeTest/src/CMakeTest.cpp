#include "CMakeTest.h"
#include "Test.h"

int main()
{
	Test t;

	int out = t.add(3, 4);

	std::cout << out << std::endl;

	return 0;
}
