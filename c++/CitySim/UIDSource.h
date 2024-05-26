#pragma once
class UIDSource
{
public:
	int get();
	void release(int uid);
	bool exists(int uid);
	void reset();

private:
	std::set<int> releasedUIDs;
	int nextUID = 0;
};
