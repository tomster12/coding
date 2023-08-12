
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BenChallenges
{
    class Program
    {
        static void Main(string[] args)
        {
            System.Console.Out.WriteLine("Enter digit count:");
            int count = int.Parse(System.Console.In.ReadLine());
            
            System.Console.Out.WriteLine("Enter digits:");
            Dictionary<int, int> numberCounts = new Dictionary<int, int>();
            for (int i = 0; i < count; i++)
            {
                int num = int.Parse(System.Console.In.ReadLine());
                numberCounts[num] = (numberCounts.ContainsKey(num) ? numberCounts[num] : 0) + 1;
            }

            //KeyValuePair<int, int> maxPair = numberCounts.Max();
            //if (numberCounts.Where<int, int>())

            int largestNumber = -1, largestCount = -1, largestFound = 0;
            foreach (KeyValuePair<int, int> pair in numberCounts)
            {
                if (pair.Value > largestCount)
                {
                    largestNumber = pair.Key;
                    largestCount = pair.Value;
                    largestFound = 1;
                }
                else if (pair.Value == largestCount)
                {
                    largestFound++;
                }
            }
            if (largestFound > 1)
            {
                System.Console.Out.WriteLine("multimodal dataset, " + largestFound + " found with count " + largestCount);
            }
            else
            {
                System.Console.Out.WriteLine("Mode: " + largestNumber + " with " + largestCount);
            }
        }
    }
}
