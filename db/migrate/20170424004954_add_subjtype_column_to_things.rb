class AddSubjtypeColumnToThings < ActiveRecord::Migration
  def change
    add_column :things, :subjtype, :string
  end
end
