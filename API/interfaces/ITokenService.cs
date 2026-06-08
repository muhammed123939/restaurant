using System;
using API.Entities;

namespace API.interfaces;

public interface ITokenService
{
 string CreateToken (User user);
}
