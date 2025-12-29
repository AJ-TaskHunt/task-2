using Microsoft.EntityFrameworkCore;
using UserAPI.Data;

namespace UserAPI.Models
{
    public class AdminDbContext : DbContext
    {
        public AdminDbContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<AdminDTO> Admin {  get; set; }
    }
}
