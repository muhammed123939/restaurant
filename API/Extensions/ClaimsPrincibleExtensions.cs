using System;
using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincibleExtensions
{
  public static string GetAdminname(this ClaimsPrincipal admin)
  {
    var adminname = admin.FindFirstValue(ClaimTypes.NameIdentifier)
   ?? throw new Exception("cannot get Admin name from token");
    return adminname;
  }
  public static string trainnername(this ClaimsPrincipal trainner)
  {
    var trainnername = trainner.FindFirstValue(ClaimTypes.NameIdentifier)
   ?? throw new Exception("cannot get doctor name from token");
    return trainnername;
  }
  public static string clientname (this ClaimsPrincipal client)
    {
        var clientname = client.FindFirstValue(ClaimTypes.NameIdentifier) 
       ?? throw new Exception ("cannot get doctor name from token");
        return clientname ; 
    }
}
