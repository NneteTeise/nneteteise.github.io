#include <stdio.h>
#include <stdlib.h>

int main()
{
    //Variable Declarations
    int choice;
    int Calls, i;
    float Duration, totalDuration = 0.0;
    float callRate = 2.50;
    float totalCallCost = 0.0;
    int numberSessions;
    float dataUsed, totalDataUsage = 0.0;
    float dataRate = 0.10;
    float totalDataCost = 0.0;


    printf("--- Telecom Network Monitoring System ---\n");
    printf("1. Simulate Call Traffic\n");
    printf("2. Calculate Total Data Usage\n");
    printf("3. Exit\n");
    printf("Enter your choice: ");
    scanf("%d", &choice);

    switch(choice)
    {
        case 1:
            printf("Enter number of calls: ");
            scanf("%d", &Calls);

            totalDuration = 0.0;

            for(i = 1; i <= Calls; i++)
            {
                printf("Enter duration of call %d (minutes): ", i);
                scanf("%f", &Duration);
                totalDuration += Duration;
            }

            totalCallCost = totalDuration * callRate;

            printf("Total Call Duration: %.2f minutes\n", totalDuration);
            printf("Total Call Cost: R%.2f\n", totalCallCost);
            break;

        case 2:
            printf("Enter number of data sessions: ");
            scanf("%d", &numberSessions);

            totalDataUsage = 0.0;

            for(i = 1; i <= numberSessions; i++)
            {
                printf("Enter data used in session %d (MB): ", i);
                scanf("%f", &dataUsed);
                totalDataUsage += dataUsed;
            }

            totalDataCost = totalDataUsage * dataRate;

            printf("Total Data Usage: %.2f MB\n", totalDataUsage);
            printf("Total Data Cost: R%.2f\n", totalDataCost);
            break;

        case 3:
            printf("Exiting system...\n");
            break;

        default:
            printf("Sorry, incorrect input, please try again\n");
            break;
    }

    printf("Press any key to continue . . .\n");

    return 0;
}
