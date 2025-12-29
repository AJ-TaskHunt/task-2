namespace UserAPI.BO
{
    public class CommonBO
    {
        public class apiResponse<T>
        {
            public required string message { get; set; }
            public int? statusCode { get; set; }    

            public required T? result { get; set; }
        }

        public class CustomerBO
        {
            public int CustomerId { get; set; }

            public string Name { get; set; } = null!;
            public string Address { get; set; } = null!;
            public string Email { get; set; } = null!;
            public string Mobile { get; set; } = null!;
            public string PostCode { get; set; } = null!;
            public string Gender { get; set; } = null!;

            public string? PasswordHash { get; set; }

            //public byte[]? ProfileImage { get; set; }

            public IFormFile? ProfileImage { get; set; }

            public bool IsActive { get; set; } = true;
            public DateTime CreateDate { get; set; } = DateTime.Now;
        }

        public class LoginBO
        {
            public string Username {  get; set; } = string.Empty;
            public string PasswordHash { get; set; } = string.Empty;
            //public int RoleId { get; set; }
        }


        //public class AdminBO
        //{
        //    public string username { get; set; } = string.Empty;

        //    public string Password { get; set; } = string.Empty;

            
        //}
    }
}
