using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using UserAPI.BO;
using UserAPI.Data;
using UserAPI.Models;
using static UserAPI.BO.CommonBO;

namespace UserAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowAngular")]
    public class CustomerController : ControllerBase
    {
        private readonly CustomersdbContext _customersdbContext;
        private readonly AdminDbContext _adminDbContext;


        public CustomerController(CustomersdbContext customersdbContext, AdminDbContext adminDbContext)
        {
            _customersdbContext = customersdbContext;
            _adminDbContext = adminDbContext;
        }


        // ✅ DEFAULT IMAGE METHOD
        //private byte[] GetDefaultImage()
        //{
        //    var path = Path.Combine(
        //        Directory.GetCurrentDirectory(),
        //        "wwwroot/images/Default.png"
        //    );

        //    return System.IO.File.ReadAllBytes(path);
        //}

        //private string SaveProfileImage(IFormFile? file)
        //{
        //    if (file == null || file.Length == 0)
        //        return "Default.png";

        //    var extension = Path.GetExtension(file.FileName);
        //    var fileName = $"{Guid.NewGuid()}_{extension}";
        //    var path = Path.Combine(
        //        Directory.GetCurrentDirectory(),
        //        "wwwroot/images",
        //        fileName
        //    );

        //    using var stream = new FileStream(path, FileMode.Create);
        //    file.CopyTo(stream);

        //    return fileName;
        //}

        private string? SaveProfileImage(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return null;

            var imagesPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "images"
            );

            if (!Directory.Exists(imagesPath))
                Directory.CreateDirectory(imagesPath);

            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(imagesPath, fileName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            file.CopyTo(stream);

            return fileName;
        }

        [HttpGet("/api/check-email-mobile")]
        public IActionResult CheckEmailMobile(string? email, string? mobile, int customerId = 0)
        {
            bool emailExists = false;
            bool mobileExists = false;

            if (!string.IsNullOrWhiteSpace(email))
            {
                emailExists = _customersdbContext.Customers
                    .Any(x => x.Email == email && x.CustomerId != customerId);
            }

            if (!string.IsNullOrWhiteSpace(mobile))
            {
                mobileExists = _customersdbContext.Customers
                    .Any(x => x.Mobile == mobile && x.CustomerId != customerId);
            }

            return Ok(new
            {
                emailExists,
                mobileExists
            });
        }


        private static string? Clean(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        [HttpPost("/api/addUpdateCustomerData")]
        public apiResponse<CustomersDTO> addUpdateCustomerData([FromForm] CustomerBO obj)
        {
            try
            {
                //var customer = _customersdbContext.Customers.Where(x => x.CustomerId == obj.CustomerId).FirstOrDefault();
                var customer = _customersdbContext.Customers.FirstOrDefault(x => x.CustomerId == obj.CustomerId);

                bool emailExists = _customersdbContext.Customers.Any(x => x.Email == obj.Email && x.CustomerId != obj.CustomerId);
                bool mobileExists = _customersdbContext.Customers.Any(x => x.Mobile == obj.Mobile && x.CustomerId != obj.CustomerId);

                if (emailExists)
                    return new apiResponse<CustomersDTO>
                    {
                        message = "Email already registered with another customer",
                        statusCode = 409,
                        result = null
                    };
                else if (mobileExists)
                    return new apiResponse<CustomersDTO>
                    {
                        message = "Mobile already registered with another customer",
                        statusCode = 409,
                        result = null
                    };

                if (customer != null)
                {
                    //Update case
                    customer.Name = Clean(obj.Name) ?? string.Empty;
                    customer.Email = Clean(obj.Email)?.ToLower() ?? string.Empty;
                    customer.Address = Clean(obj.Address) ?? string.Empty;
                    customer.Gender = Clean(obj.Gender) ?? string.Empty;
                    customer.Mobile = Clean(obj.Mobile) ?? string.Empty;
                    customer.PostCode = Clean(obj.PostCode) ?? string.Empty;
                    //customer.PasswordHash = Clean(obj.PasswordHash) ?? string.Empty;
                    customer.IsActive = obj.IsActive;
                    // 🔴 image logic
                    //if (obj.profileimage != null && obj.profileimage.length > 0)
                    //{
                    //    customer.profileimage = obj.profileimage; // new image
                    //}
                    //if (obj.profileimage != null && obj.profileimage.length > 0)
                    //{
                    //    customer.profileimage = saveprofileimage(obj.profileimage);
                    //}

                    var newImage = SaveProfileImage(obj.ProfileImage);
                    if (!string.IsNullOrEmpty(newImage))
                    {
                        customer.ProfileImage = newImage;
                    }
                    _customersdbContext.SaveChanges();

                    return new apiResponse<CustomersDTO>
                    {
                        message = "Customer updated successfully",
                        statusCode = 200,
                        result = customer
                    };
                }
                else
                {
                    //add case
                    var imageName = SaveProfileImage(obj.ProfileImage) ?? "Default.png";

                    var alreadyRegistedEmail = _customersdbContext.Customers.Any(m => m.Email == obj.Email);
                    var alreadyRegistedMobile = _customersdbContext.Customers.Any(m => m.Mobile == obj.Mobile);
                    if (alreadyRegistedEmail == true)
                        return new apiResponse<CustomersDTO> { message = "Email already registed!", statusCode = 409, result = null };
                    else if (alreadyRegistedMobile == true)
                        return new apiResponse<CustomersDTO> { message = "Mobile already registed", statusCode = 409, result = null };

                    CustomersDTO cdata = new CustomersDTO
                    {
                        Name = Clean(obj.Name) ?? string.Empty,
                        Email = Clean(obj.Email)?.ToLower() ?? string.Empty,
                        Address = Clean(obj.Address) ?? string.Empty,
                        Gender = Clean(obj.Gender) ?? string.Empty,
                        Mobile = Clean(obj.Mobile) ?? string.Empty,
                        PostCode = Clean(obj.PostCode) ?? string.Empty,
                        PasswordHash = Clean(obj.PasswordHash) ?? string.Empty,
                        ProfileImage = imageName,
                        IsActive = obj.IsActive,
                        CreateDate = DateTime.Now,
                        RoleId = 2

                        //// 🔴 Image logic
                        //ProfileImage = obj.ProfileImage != null && obj.ProfileImage.Length > 0
                        //? obj.ProfileImage : GetDefaultImage(),
                    };

                    _customersdbContext.Add(cdata);
                    _customersdbContext.SaveChanges();

                    return new apiResponse<CustomersDTO>
                    {
                        message = "Customer registered successfully",
                        statusCode = 200,
                        result = cdata
                    };
                }
            }
            catch (Exception ex)
            {

                return new apiResponse<CustomersDTO>
                {
                    message = ex.InnerException?.Message ?? ex.Message,
                    statusCode = 500,
                    result = null

                };
            }
        }

        [HttpGet("/api/getCustomerDataById")]
        public apiResponse<CustomersDTO> getCustomerDataById(int id)
        {
            try
            {
                var cdata = _customersdbContext.Customers.FirstOrDefault(x => x.CustomerId == id);

                if (cdata == null)
                {
                    return new apiResponse<CustomersDTO> { message = "No data found", statusCode = 404, result = null };
                }
                else
                {
                    return new apiResponse<CustomersDTO> { message = "OK", result = cdata, statusCode = 200 };
                }
            }
            catch (Exception ex)
            {

                return new apiResponse<CustomersDTO>
                {
                    message = ex.InnerException?.Message ?? ex.Message,
                    statusCode = 500,
                    result = null
                };
            }
        }

        [HttpGet("/api/getAllCustomerData")]
        public apiResponse<List<CustomersDTO>> getAllCustomerData()
        {
            try
            {
                var getData = _customersdbContext.Customers.ToList();

                if (getData.Count == 0)
                {
                    return new apiResponse<List<CustomersDTO>> { message = "No data found", result = null };
                }
                else
                {
                    return new apiResponse<List<CustomersDTO>> { message = "OK", result = getData, statusCode = 200 };
                }
            }
            catch (Exception ex)
            {

                return new apiResponse<List<CustomersDTO>>
                {
                    message = ex.InnerException?.Message ?? ex.Message,
                    statusCode = 500,
                    result = null
                };
            }

        }

        [HttpPost("/api/login")]
        public apiResponse<object> login([FromBody] LoginBO obj)
        {
            // 1️⃣ Try ADMIN first
            var admin = _adminDbContext.Admin
                .FirstOrDefault(x => x.Name == obj.Username);

            if (admin != null)
            {
                if (admin.Password != obj.PasswordHash)
                {
                    return new apiResponse<object>
                    {
                        message = "Invalid password",
                        statusCode = 401,
                        result = null
                    };
                }

                if (admin.RoleId != 1)
                {
                    return new apiResponse<object>
                    {
                        message = "Unauthorized role",
                        statusCode = 403,
                        result = null
                    };
                }

                // Admin session
                HttpContext.Session.SetInt32("AdminId", admin.AdminId);
                HttpContext.Session.SetString("UserName", admin.Name);
                HttpContext.Session.SetInt32("RoleId", admin.RoleId);

                return new apiResponse<object>
                {
                    message = "Admin login successful",
                    statusCode = 200,
                    result = new
                    {
                        admin.AdminId,
                        admin.Name,
                        admin.RoleId
                    }
                };
            }

            // 2️⃣ Try CUSTOMER
            var user = _customersdbContext.Customers
                .FirstOrDefault(x => x.Email == obj.Username || x.Mobile == obj.Username);

            if (user == null)
            {
                return new apiResponse<object>
                {
                    message = "User not found",
                    statusCode = 404,
                    result = null
                };
            }

            if (!user.IsActive)
            {
                return new apiResponse<object>
                {
                    message = "Account blocked",
                    statusCode = 403,
                    result = null
                };
            }

            if (user.PasswordHash != obj.PasswordHash)
            {
                return new apiResponse<object>
                {
                    message = "Invalid password",
                    statusCode = 401,
                    result = null
                };
            }

            if (user.RoleId != 2)
            {
                return new apiResponse<object>
                {
                    message = "Unauthorized role",
                    statusCode = 403,
                    result = null
                };
            }

            // Customer session
            HttpContext.Session.SetInt32("CustomerId", user.CustomerId);
            HttpContext.Session.SetString("UserName", user.Name);
            HttpContext.Session.SetInt32("RoleId", user.RoleId);

            return new apiResponse<object>
            {
                message = "User login successful",
                statusCode = 200,
                result = new
                {
                    user.CustomerId,
                    user.Name,
                    user.RoleId
                }
            };
        }


        [HttpGet("/api/myProfile")]
        public apiResponse<CustomersDTO> myProfile()
        {

            try
            {
                int? customerId = HttpContext.Session.GetInt32("CustomerId");

                if (customerId == null)
                {
                    return new apiResponse<CustomersDTO>
                    {
                        message = "No data found",
                        statusCode = 404,
                        result = null
                    };
                }

                var cdata = _customersdbContext.Customers.FirstOrDefault(x => x.CustomerId == customerId.Value);

                if (cdata == null)
                {
                    return new apiResponse<CustomersDTO>
                    {
                        message = "No data found",
                        statusCode = 404,
                        result = null
                    };
                }

                return new apiResponse<CustomersDTO>
                {
                    message = "OK",
                    statusCode = 200,
                    result = cdata
                };

            }
            catch (Exception ex)
            {
                return new apiResponse<CustomersDTO>
                {

                    message = ex.InnerException?.Message ?? ex.Message,
                    statusCode = 500,
                    result = null
                };
            }
        }


        [HttpPost("/api/updateMyProfile")]

        public apiResponse<CustomersDTO> updateMyProfile([FromForm] CustomerBO obj)
        {
            try
            {
                //ModelState.Clear();

                //if (!ModelState.IsValid)
                //{
                //    return new apiResponse<CustomersDTO>
                //    {
                //        statusCode = 400,
                //        message = string.Join(" | ",
                //            ModelState.Values
                //              .SelectMany(v => v.Errors)
                //              .Select(e => e.ErrorMessage)),
                //        result = null
                //    };
                //}

                int? cId = HttpContext.Session.GetInt32("CustomerId");

                if (cId == null)
                {
                    return new apiResponse<CustomersDTO>
                    {
                        statusCode = 401,
                        message = "Unauthorized",
                        result = null
                    };
                }

                var customer = _customersdbContext.Customers.FirstOrDefault(x => x.CustomerId == cId.Value);

                if (customer == null)
                {
                    return new apiResponse<CustomersDTO>
                    {
                        statusCode = 404,
                        message = "Customer not found",
                        result = null
                    };
                }

                //Duplicate checks

                bool emailExists = _customersdbContext.Customers.Any(x => x.Email == obj.Email && x.CustomerId != cId.Value);
                bool mobileExists = _customersdbContext.Customers.Any(x => x.Mobile == obj.Mobile && x.CustomerId != cId.Value);

                if (emailExists)
                    return new apiResponse<CustomersDTO> { statusCode = 409, message = "Email already exists", result = null };
                if (mobileExists)
                    return new apiResponse<CustomersDTO> { statusCode = 409, message = "Mobile already exists", result = null };

                //update profile

                customer.Name = Clean(obj.Name) ?? string.Empty;
                customer.Email = Clean(obj.Email)?.ToLower() ?? string.Empty;
                customer.Address = Clean(obj.Address) ?? string.Empty;
                customer.Mobile = Clean(obj.Mobile) ?? string.Empty;
                customer.PostCode = Clean(obj.PostCode) ?? string.Empty;
                customer.Gender = Clean(obj.Gender) ?? string.Empty;
                //customer.IsActive = obj.IsActive;

                var newImage = SaveProfileImage(obj.ProfileImage);
                if (!string.IsNullOrEmpty(newImage))
                {
                    customer.ProfileImage = newImage;
                }

                _customersdbContext.SaveChanges();

                return new apiResponse<CustomersDTO>
                {
                    statusCode = 200,
                    message = "Profile updated successfully",
                    result = customer
                };
            }
            catch (Exception ex)
            {
                return new apiResponse<CustomersDTO>
                {
                    statusCode = 500,
                    message = ex.InnerException?.Message ?? ex.Message,
                    result = null
                };
            }

        }

        [HttpGet("/api/deleteCustomerDataById")]
        public apiResponse<CustomersDTO> deleteCustomerDataById(int id)
        {
            try
            {
                var cdata = _customersdbContext.Customers.FirstOrDefault(x => x.CustomerId == id);

                if (cdata != null)
                {
                    _customersdbContext.Customers.Remove(cdata);
                    _customersdbContext.SaveChanges();
                    return new apiResponse<CustomersDTO>
                    {
                        statusCode = 200,
                        message = "Customer data deleted successfully",
                        result = null
                    };
                }

                return new apiResponse<CustomersDTO>
                {
                    statusCode = 404,
                    message = "No data found",
                    result = null
                };
            }
            catch (Exception ex)
            {
                return new apiResponse<CustomersDTO>
                {
                    statusCode = 500,
                    message = ex.InnerException?.Message ?? ex.Message,
                    result = null
                };
            }
        }

    }
}
