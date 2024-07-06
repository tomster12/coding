#include <iostream>
#include <vector>

template<typename T>
class HistoricalList
{
public:
	class Step
	{
	public:
		virtual void apply(std::vector<T>& list) = 0;
		virtual void undo(std::vector<T>& list) = 0;
		virtual void print() const = 0;
	};

	class InsertStep : public Step
	{
	public:
		InsertStep(size_t index, T&& item) : index(index), item(std::forward<T>(item)) {}

		void apply(std::vector<T>& list) override
		{
			list.insert(list.begin() + index, item);
		}

		void undo(std::vector<T>& list) override
		{
			list.erase(list.begin() + index);
		}

		void print() const override
		{
			std::cout << "InsertStep: index=" << index << ", item=" << item << std::endl;
		}

	private:
		size_t index;
		T item;
	};

	class ChangeStep : public Step
	{
	public:
		ChangeStep(size_t index, T&& item) : index(index), item(std::forward<T>(item)) {}

		void apply(std::vector<T>& list) override
		{
			oldItem = list[index];
			list[index] = item;
		}

		void undo(std::vector<T>& list) override
		{
			list[index] = oldItem;
		}

		void print() const override
		{
			std::cout << "ChangeStep: index=" << index << ", oldItem=" << oldItem << ", newItem=" << item << std::endl;
		}

	private:
		size_t index;
		T oldItem = T();
		T item;
	};

	class RemoveStep : public Step
	{
	public:
		RemoveStep(size_t index) : index(index) {}

		void apply(std::vector<T>& list) override
		{
			oldItem = list[index];
			list.erase(list.begin() + index);
		}

		void undo(std::vector<T>& list) override
		{
			list.insert(list.begin() + index, oldItem);
		}

		void print() const override
		{
			std::cout << "RemoveStep: index=" << index << ", oldItem=" << oldItem << std::endl;
		}

	private:
		size_t index;
		T oldItem = T();
	};

public:
	void insert(size_t index, T&& item)
	{
		std::shared_ptr<Step> step = std::make_shared<InsertStep>(index, std::forward<T>(item));
		step->apply(list);
		history.push_back(step);
	}

	void push_back(T&& item)
	{
		insert(list.size(), std::forward<T>(item));
	}

	void change(size_t index, T&& item)
	{
		std::shared_ptr<Step> step = std::make_shared<ChangeStep>(index, std::forward<T>(item));
		step->apply(list);
		history.push_back(step);
	}

	void remove(size_t index)
	{
		std::shared_ptr<Step> step = std::make_shared<RemoveStep>(index);
		step->apply(list);
		history.push_back(step);
	}

	void undo(size_t steps = 1)
	{
		for (size_t i = 0; i < steps; i++)
		{
			if (history.empty())
			{
				return;
			}

			history.back()->undo(list);
			history.pop_back();
		}
	}

	const T& operator[](size_t index) const
	{
		return list[index];
	}

	HistoricalList<T> snapshotAt(size_t step) const
	{
		step = (step + history.size()) % history.size();

		std::vector<T> snapshotList;
		std::vector<std::shared_ptr<Step>> snapshotHistory;

		for (size_t i = 0; i < step; i++)
		{
			history[i]->apply(snapshotList);
			snapshotHistory.push_back(history[i]);
		}

		HistoricalList<T> snapshot;
		snapshot.list = snapshotList;
		snapshot.history = snapshotHistory;
		return snapshot;
	}

	std::vector<T> getList() const
	{
		return list;
	}

	std::vector<T> getListAt(int step) const
	{
		step = (step + history.size()) % history.size();

		std::vector<T> snapshotList = list;

		for (size_t i = 0; i < step; i++)
		{
			history[i]->apply(snapshotList);
		}

		return snapshotList;
	}

	void print() const
	{
		std::cout << "List (size=" << list.size() << ", history=" << history.size() << "): ";

		for (const T& item : list)
		{
			std::cout << item << " ";
		}

		std::cout << std::endl;

		for (const std::shared_ptr<Step>& step : history)
		{
			step->print();
		}

		std::cout << std::endl;
	}

	size_t size() const
	{
		return list.size();
	}

	size_t historySize() const
	{
		return history.size();
	}

private:
	std::vector<T> list;
	std::vector<std::shared_ptr<Step>> history;
};

template<typename T>
class HistoricalValue
{
public:
	HistoricalValue(T value)
	{
		history.push_back(value);
	}

	void set(T value)
	{
		history.push_back(value);
	}

	const T& get() const
	{
		return history.back();
	}

	void undo()
	{
		if (history.size() > 1)
		{
			history.pop_back();
		}
	}

	HistoricalValue<T> snapshotAt(int step) const
	{
		step = (step + history.size()) % history.size();

		HistoricalValue<T> snapshot(history[step]);
		snapshot.history = std::vector<T>(history.begin(), history.begin() + step + 1);
		return snapshot;
	}

	T getAt(int step) const
	{
		step = (step + history.size()) % history.size();
		return history[step];
	}

	void print() const
	{
		std::cout << "Value (history=" << history.size() << "): ";

		for (const T& value : history)
		{
			std::cout << value << " ";
		}

		std::cout << std::endl;
	}

private:
	std::vector<T> history;
};

int main()
{
	HistoricalList<int> list;
	list.push_back(1);
	list.push_back(3);
	list.push_back(5);
	list.insert(1, 2);
	list.change(2, 4);
	list.remove(0);
	list.undo();
	list.remove(3);
	HistoricalList<int> snapshot = list.snapshotAt(2);
	list.print();
	snapshot.print();

	HistoricalValue<int> value(1);
	value.set(4);
	value.set(5);
	value.set(8);
	value.undo();
	value.print();
}
