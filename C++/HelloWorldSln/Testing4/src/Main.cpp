
#include <iostream>
#define LOG(x) std::cout << (x) << std::endl


class Singleton {
public:
	static Singleton* s_instance;
	static Singleton& get() {return *s_instance;}
private:

public:
	int i;
	void hello() {
		LOG("hi");
		LOG(i);
		i++;
	}
};
Singleton* Singleton::s_instance = new Singleton{5};

struct Entity {
	static int num;
	int x, y;
	void print() {
		LOG(x);
		LOG(y);
	}
};
int Entity::num;


void Function() {
	static int i = 0;
	LOG(i);
	i++;
}

int main() {
	Entity e0 = {2, 3};
	Entity e1 = {1, 6};
	e0.print();
	
	LOG("-----");

	e0.num = 2;
	e1.num = 7;
	LOG(Entity::num);
	Entity::num = 5;
	LOG(Entity::num);

	LOG("-----");

	Function();
	Function();
	Function();
	Function();

	LOG("-----");
	
	Singleton::get().hello();
	Singleton::get().hello();
	(*Singleton::s_instance).hello();
	std::cin.get();
}