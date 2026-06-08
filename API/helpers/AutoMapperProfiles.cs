using System;
using API.DTO;
using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<User, UserDataDTO>()
            .ForMember(dest => dest.BranchName,
                       opt => opt.MapFrom(src => src.Branch != null ? src.Branch.Name : null));
        CreateMap<RegisterUserDto, User>();
        CreateMap<OrderForDeliveryDTO, OrdersForDelivery>().ReverseMap();
        CreateMap<CustomerAddressDTO, CustomerAddress>().ReverseMap();
        CreateMap<TableDTO, Table>().ReverseMap();
        CreateMap<Order, OrderDTO>()
    .ForMember(dest => dest.BranchName,
        opt => opt.MapFrom(src => src.Branch != null ? src.Branch.Name : null))
    .ReverseMap()
    .ForMember(dest => dest.Branch, opt => opt.Ignore());
        CreateMap<User, UserDataDTO>()
            .ForMember(dest => dest.Role,
                opt => opt.MapFrom(src => src.Role))
            .ForMember(dest => dest.BranchName,
                opt => opt.MapFrom(src => src.Branch != null ? src.Branch.Name : null));
        CreateMap<Branch, BranchDTO>().ReverseMap();
        CreateMap<Menu, MenuDTO>().ReverseMap();
        CreateMap<Menu, RegistermenuDTO>().ReverseMap();
        CreateMap<Employee, EmployeeDTO>()
            .ForMember(dest => dest.UserID,
                opt => opt.MapFrom(src => src.User.UserID))

            .ForMember(dest => dest.BranchName,
                opt => opt.MapFrom(src => src.User.Branch != null ? src.User.Branch.Name : null))

            .ForMember(dest => dest.User,
                opt => opt.MapFrom(src => src.User));   // ✅ THIS is the correct way
        CreateMap<Employee, User>().ReverseMap();
        CreateMap<UserDataUpdateDTO, User>();
    }

}
