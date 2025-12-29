using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserAPI.Data
{

    [Table("Admin")]
    public class AdminDTO
    {
        [Key]

        public int AdminId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public int RoleId { get; set; } 
    }
}
