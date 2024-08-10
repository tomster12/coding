using System;
using Unity.Netcode;
using UnityEngine;
using Unity.Multiplayer.Playmode;
using System.Linq;
using Unity.Netcode.Transports.UTP;

public class App : MonoBehaviour
{
    [SerializeField] private NetworkManager networkManager;
    [SerializeField] private UnityTransport transport;

    private void Start()
    {
        Debug.Log(transport.ConnectionData);
        Debug.Log(transport.ConnectionData.Address);
        Debug.Log(transport.ConnectionData.Port);
        Debug.Log(transport.ConnectionData.ServerListenAddress);
        Debug.Log(transport.ConnectionData.ListenEndPoint);
        Debug.Log(transport.ConnectionData.ServerEndPoint);

        if (CurrentPlayer.ReadOnlyTags().Contains("Server"))
        {
            networkManager.StartServer();
        }
        else
        {
            networkManager.StartClient();
        }
    }
}
