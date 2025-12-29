using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UserAPI.Data
{
    [Table("Customers")]
    public class CustomersDTO
    {
        [Key]
        public int CustomerId { get; set; }

        public string Name { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Mobile { get; set; } = null!;
        public string PostCode { get; set; } = null!;
        public string Gender { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        //public byte[]? ProfileImage { get; set; }

        public string? ProfileImage { get; set; } = "Default.png";

        public bool IsActive { get; set; } = true;
        public DateTime CreateDate { get; set; } = DateTime.Now;

        public int RoleId { get; set; }

    }
}
