<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL/TiDB: status column is VARCHAR, no named CHECK constraint needed
        // Just ensure status column supports the new 'tunggu_bidan' value (already allowed as VARCHAR)
    }

    public function down(): void
    {
        // No-op for MySQL/TiDB
    }
};
