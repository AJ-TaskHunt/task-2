using Microsoft.EntityFrameworkCore;
using UserAPI.Data;

namespace UserAPI.Models
{
    public class CustomersdbContext : DbContext
    {
        public CustomersdbContext(DbContextOptions<CustomersdbContext>options):base (options)
        {
            
        }

        public DbSet<CustomersDTO> Customers { get; set; }
    }
}
